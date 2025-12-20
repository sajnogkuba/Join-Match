import { Navigate } from "react-router-dom";
import CreateTeamForm from "../components/CreateTeamForm.tsx";
import { getCookie } from "../utils/cookies";

const CreateTeamPage = () => {
  const ownerEmail = getCookie("email");

  if (!ownerEmail) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gray-800 pt-10">
      <CreateTeamForm />
    </div>
  );
};

export default CreateTeamPage;