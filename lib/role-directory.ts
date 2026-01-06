
// This file acts as the central directory for mapping DoA Roles to actual people.
// In a full production app, this would likely be in the User database with "Job Titles".

export type RoleContact = {
    name: string;
    email: string;
}

export const ROLE_DIRECTORY: Record<string, RoleContact> = {
    // Executive Leadership
    "CEO": { name: "Sarah Connor", email: "sarah.ceo@cwit.lk" },
    "CFO": { name: "Jean-Luc Picard", email: "jean.cfo@cwit.lk" },
    "COO": { name: "Ellen Ripley", email: "ellen.coo@cwit.lk" },

    // Finance
    "Finance Director": { name: "Geordi La Forge", email: "geordi.fin@cwit.lk" },
    "Finance Manager": { name: "Hikaru Sulu", email: "sulu.fin@cwit.lk" },

    // Management
    "Line Manager": { name: "William Riker", email: "will.riker@cwit.lk" }, // Default fallback
    "Head of Department": { name: "Kathryn Janeway", email: "janeway.hod@cwit.lk" },

    // Specialized
    "IT Director": { name: "Data Soong", email: "data.it@cwit.lk" },
    "HR Director": { name: "Deanna Troi", email: "deanna.hr@cwit.lk" },
};

export function getContactForRole(roleName: string): RoleContact {
    return ROLE_DIRECTORY[roleName] || {
        name: "Approver",
        email: roleName.replace(/\s+/g, '.').toLowerCase() + "@cwit.lk"
    };
}
