import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuthRepository } from "../context/RepositoriesContext";

export function LoginPage() {
  const navigate = useNavigate();
  const authRepository = useAuthRepository();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      const user = await authRepository.getCurrentUser();
      if (!canceled && user) {
        navigate("/", { replace: true });
      }
    })();

    return () => {
      canceled = true;
    };
  }, [authRepository, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Informe email e senha.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authRepository.signInWithPassword({
        email: email.trim(),
        password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao autenticar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F7F8FA] dark:bg-[#0A0A0A]">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A] flex items-center justify-center">
            <Lock className="w-10 h-10 text-[#2563EB] dark:text-[#93C5FD]" />
          </div>
        </div>

        <Card className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#111827] dark:text-[#F7F8FA]">
              Entrar
            </CardTitle>
            <CardDescription className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Autentique-se para acessar a plataforma.
            </CardDescription>
          </CardHeader>

          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@empresa.com"
                  className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
