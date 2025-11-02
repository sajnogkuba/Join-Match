import { Navigate } from "react-router-dom";
import CreateEventForm from "../components/CreateEventForm.tsx";

const CreateEventPage = () => {
  const ownerEmail = localStorage.getItem("email");

  if (!ownerEmail) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gray-800 pt-10">
      <CreateEventForm />
    </div>
  );
};

export default CreateEventPage;