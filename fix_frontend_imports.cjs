const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "dashboard", "src");

// Map of old paths to new paths
const PATH_MAP = {
    // Core & Shared
    "@/app/": "@/core/app/",
    "@/shared/lib/": "@/core/lib/",
    "@/shared/layouts/": "@/shared_logic/layouts/",
    "@/shared/components/ui/": "@/public_zone/ui/",
    "@/shared/components/dashboard/Header": "@/public_zone/components/Header",
    "@/shared/components/dashboard/Sidebar": "@/public_zone/components/Sidebar",
    "@/shared/components/dashboard/CommandPalette": "@/public_zone/components/CommandPalette",
    "@/shared/components/dashboard/AgentSwitcher": "@/shared_logic/general/components/AgentSwitcher",
    "@/shared/components/dashboard/DashboardChart": "@/shared_logic/general/components/DashboardChart",

    // Admin
    "@/admin/": "@/admin_zone/pages/",
    "@/shared/components/dashboard/MetricCard": "@/admin_zone/components/MetricCard",
    "@/shared/components/dashboard/Cards/StatCard": "@/admin_zone/components/StatCard",

    // Broker
    "@/broker/": "@/broker_zone/pages/",
    "@/shared/components/dashboard/Cards/BrokerCard": "@/broker_zone/components/BrokerCard",

    // RED
    "@/red/": "@/red_zone/pages/",
    "@/shared/components/dashboard/Cards/REDCard": "@/red_zone/components/REDCard",

    // Shared Pages -> General
    "@/shared/pages/dashboard/Overview": "@/shared_logic/general/pages/Overview",
    "@/shared/pages/dashboard/Inbox": "@/shared_logic/general/pages/Inbox",
    "@/shared/pages/dashboard/Settings": "@/shared_logic/general/pages/Settings",
    "@/shared/pages/dashboard/Organization": "@/shared_logic/general/pages/Organization",

    // Shared Properties 
    "@/shared/pages/dashboard/properties": "@/shared_logic/properties/pages",
    "@/shared/components/dashboard/Properties": "@/shared_logic/properties/components",
    "@/shared/components/dashboard/Cards/PropertyCard": "@/shared_logic/properties/components/PropertyCard",

    // Shared Offers
    "@/shared/pages/dashboard/offers": "@/shared_logic/offers/pages",
    "@/shared/components/dashboard/Offers": "@/shared_logic/offers/components",

    // Public/User
    "@/user/": "@/user_zone/pages/",
    "@/auth/": "@/public_zone/auth/",
    "@/landing/": "@/public_zone/landing/"
};

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function processFiles() {
    const allFiles = getAllFiles(SRC_DIR);
    let filesModified = 0;

    for (const filePath of allFiles) {
        let content = fs.readFileSync(filePath, "utf-8");
        let needsWrite = false;

        // Apply exact map replacements
        for (const [oldPath, newPath] of Object.entries(PATH_MAP)) {
            // Regex to match imports exactly, accounting for quotes
            const regex = new RegExp(`from (["'])${oldPath.replace(/\//g, '\\/')}`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `from $1${newPath}`);
                needsWrite = true;
            }

            // Handle dynamic imports or generic matching
            const regexGeneric = new RegExp(`(["'])${oldPath.replace(/\//g, '\\/')}`, 'g');
            if (regexGeneric.test(content)) {
                content = content.replace(regexGeneric, `$1${newPath}`);
                needsWrite = true;
            }
        }

        if (needsWrite) {
            fs.writeFileSync(filePath, content, "utf-8");
            filesModified++;
        }
    }

    console.log(`✅ Processed ${allFiles.length} files. Modifed imports in ${filesModified} files.`);
}

processFiles();
