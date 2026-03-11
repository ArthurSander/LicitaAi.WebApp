import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthRepository } from '../context/RepositoriesContext';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export function LoginPage() {
  const navigate = useNavigate();
  const authRepository = useAuthRepository();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    authRepository
      .getCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        if (user) navigate('/');
      })
      .catch(() => {
        // ignore; user is not authenticated
      });

    return () => {
      isMounted = false;
    };
  }, [authRepository, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authRepository.signInWithPassword({ email, password });
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível entrar. Verifique seus dados e tente novamente.';
      setErrorMessage(message);
      console.error('Login failed:', { email, rememberMe, err });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2563EB] dark:bg-[#1E3A8A] mb-6">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-[#F7F8FA] mb-2">
            Radar Licitações
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Erro ao entrar</AlertTitle>
              <AlertDescription>
                <p>{errorMessage}</p>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm text-[#111827] dark:text-[#F7F8FA]"
            >
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm text-[#111827] dark:text-[#F7F8FA]"
            >
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F7F8FA] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked === true)
                }
                disabled={isSubmitting}
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#6B7280] dark:text-[#9CA3AF] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar de mim
              </label>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              className="text-sm text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white h-10"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-8">
          Não tem uma conta?{' '}
          <button
            type="button"
            className="text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] font-medium transition-colors"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}