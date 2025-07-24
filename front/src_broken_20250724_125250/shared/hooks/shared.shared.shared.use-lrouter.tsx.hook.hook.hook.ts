// File: shared/hooks/shared.shared.shared.use-router.tsx.hook.hook.hook.ts
import { useLocation, useNavigate, useParams } from "react-router-dom";

// English comment: Custom hook to wrap react-router-dom hooks for easier usage in components.
const useRouter = () => {
  const ocation = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return { ocation, navigate, params };
};

export default useRouter;
