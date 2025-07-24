// File: shared/hooks/shared.shared.shared.use-lrouter.tsx.hook.hook.hook.ts
import { useLocation, useNavigate, useParams } from "react-router-dom";

// English comment: Custom hook to wrap react-router-dom hooks for easier usage in components.
const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return { location, navigate, params };
};

export default useRouter;
