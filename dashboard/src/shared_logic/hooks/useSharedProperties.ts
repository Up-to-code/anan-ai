import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "convex/_generated/api";
import { useRole } from "@/_core/hooks/useRole";
import type { Id } from "convex/_generated/dataModel";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

export function useSharedProperties() {
    const role = useRole();
    const { isAuthenticated } = useConvexAuth();
    const { shouldRunProtectedQueries } = useConvexBootstrapState();
    const banks = useQuery(api.shared_logic.services.banks.list, {});

    // --- List Properties ---
    // Gate on Convex auth to avoid getAuthUser throwing before token is validated
    const propertiesBroker = useQuery(
        api.broker_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "broker" ? { paginationOpts: { numItems: 100, cursor: null } } : "skip"
    );
    const propertiesRED = useQuery(
        api.red_zone.properties.listMyProperties,
        shouldRunProtectedQueries && role === "RED" ? { paginationOpts: { numItems: 100, cursor: null } } : "skip"
    );
    const properties = role === "broker" ? propertiesBroker?.page : propertiesRED?.page;

    // --- Get Property ---
    const getProperty = (id?: string) => {
        const propBroker = useQuery(
            api.broker_zone.properties.getProperty,
            shouldRunProtectedQueries && role === "broker" && id ? { id: id as Id<"properties"> } : "skip"
        );
        const propRED = useQuery(
            api.red_zone.properties.getProperty,
            shouldRunProtectedQueries && role === "RED" && id ? { id: id as Id<"properties"> } : "skip"
        );
        return role === "broker" ? propBroker : propRED;
    };

    const getPropertyDetail = (id?: string) => {
        return useQuery(
            // Need string since the new shared_logic location might not be codegened yet
            "shared_logic/queries:getPropertyDetail" as any,
            shouldRunProtectedQueries && id ? { id: id as Id<"properties"> } : "skip"
        ) as any;
    };

    // --- Utils ---
    const generateUploadUrl = useMutation("shared_logic/lib/storage:generateUploadUrl" as any);
    const utils = {
        getImageUrl: (id: Id<"_storage">) => useQuery("shared_logic/lib/storage:getUrl" as any, { storageId: id })
    };

    // --- Mutations ---
    const updatePropertyBroker = useMutation(api.broker_zone.properties.updateProperty);
    const updatePropertyRED = useMutation(api.red_zone.properties.updateProperty);
    const deletePropertyBroker = useMutation(api.broker_zone.properties.deleteProperty);
    const deletePropertyRED = useMutation(api.red_zone.properties.deleteProperty);
    const createPropertyBroker = useMutation(api.broker_zone.properties.createProperty);
    const createPropertyRED = useMutation(api.red_zone.properties.createProperty);
    const publishPropertyBroker = useMutation(api.broker_zone.properties.publishProperty);
    const publishPropertyRED = useMutation(api.red_zone.properties.publishProperty);

    const createProperty = async (payload: any) => {
        if (role === "broker") return createPropertyBroker(payload);
        if (role === "RED") return createPropertyRED(payload);
        throw new Error("Unauthorized role for createProperty");
    };

    const updateProperty = async (payload: any) => {
        if (role === "broker") return updatePropertyBroker(payload);
        if (role === "RED") return updatePropertyRED(payload);
        throw new Error("Unauthorized role for updateProperty");
    };

    const deleteProperty = async (id: string) => {
        if (role === "broker") return deletePropertyBroker({ id: id as Id<"properties"> });
        if (role === "RED") return deletePropertyRED({ id: id as Id<"properties"> });
        throw new Error("Unauthorized role for deleteProperty");
    };

    const publishProperty = async (id: string) => {
        if (role === "broker") return publishPropertyBroker({ id: id as Id<"properties"> });
        if (role === "RED") return publishPropertyRED({ id: id as Id<"properties"> });
        throw new Error("Unauthorized role for publishProperty");
    };

    return {
        role,
        banks,
        properties,
        getProperty,
        getPropertyDetail,
        createProperty,
        updateProperty,
        deleteProperty,
        publishProperty,
        generateUploadUrl,
        utils,
        isLoading: properties === undefined,
        isBootstrap: !shouldRunProtectedQueries && properties === undefined,
    };
}
