import { useNavigate } from 'react-router';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A] flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-[#2563EB] dark:text-[#93C5FD]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[32px] font-semibold text-[#111827] dark:text-[#F7F8FA] mb-3">
          Página não encontrada
        </h1>

        {/* Description */}
        <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            Ir para a busca
          </Button>
        </div>

        {/* Help text */}
        <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] mt-8">
          Código de erro: 404
        </p>
      </div>
    </div>
  );
}