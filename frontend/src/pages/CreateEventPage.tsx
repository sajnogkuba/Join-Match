import { Navigate } from "react-router-dom";
import CreateEventForm from "../components/CreateEventForm.tsx";

const CreateEventPage = () => {
  const ownerEmail = localStorage.getItem("email");

  if (!ownerEmail) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gray-800 px-10 py-10">
      <CreateEventForm />
    </div>
  );
};

export default CreateEventPage;