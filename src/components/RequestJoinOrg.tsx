import { OrganizationContext } from "@/context/OrganisationContext";
import React, { useContext } from "react";
import { Input } from "./ui/input";


//TODO: ADD PUBLIC AND PRIVATE ORGANIZATIONS

const RequestJoinOrg = () => {
  const { requestJoinOrganization } = useContext(OrganizationContext);
  const [orgId, setOrgId] = React.useState("");
  return (
    <div>
      <Input
        placeholder="Enter the organization id"
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
      />
      <button
        onClick={() =>
          requestJoinOrganization(orgId)
        }
      >
        Request to join
      </button>
    </div>
  );
};

export default RequestJoinOrg;
