import { Navigate } from "react-router-dom";
import CreateTeamForm from "../components/CreateTeamForm.tsx";

const CreateTeamPage = () => {
  const ownerEmail = localStorage.getItem("email");

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