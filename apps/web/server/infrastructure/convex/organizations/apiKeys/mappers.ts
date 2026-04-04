import type {
  OrgApiBrokerRecord,
  OrgApiClientRecord,
  OrgApiDealRecord,
  OrgApiPropertyRecord,
} from "@/server/contracts/orgApi";

export function unwrapClients(response: unknown) {
  return (response as { clients: OrgApiClientRecord[] }).clients;
}

export function unwrapClient(response: unknown) {
  return (response as { client: OrgApiClientRecord }).client;
}

export function unwrapProperties(response: unknown) {
  return (response as { properties: OrgApiPropertyRecord[] }).properties;
}

export function unwrapProperty(response: unknown) {
  return (response as { property: OrgApiPropertyRecord }).property;
}

export function unwrapDeals(response: unknown) {
  return (response as { deals: OrgApiDealRecord[] }).deals;
}

export function unwrapDeal(response: unknown) {
  return (response as { deal: OrgApiDealRecord }).deal;
}

export function unwrapBrokers(response: unknown) {
  return (response as { brokers: OrgApiBrokerRecord[] }).brokers;
}

export function unwrapBroker(response: unknown) {
  return (response as { broker: OrgApiBrokerRecord }).broker;
}
