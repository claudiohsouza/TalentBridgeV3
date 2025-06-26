import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HistoricoDesenvolvimentoInput } from '../types';

interface HistoricoFormProps {
  jovemId: number;
  onSubmit: (historico: HistoricoDesenvolvimentoInput) => Promise<void>;
  onCancel: () => void;
}

export const HistoricoForm: React.FC<HistoricoFormProps> = ({
  jovemId,
  onSubmit,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  const [formData, setFormData] = useState<HistoricoDesenvolvimentoInput>({
    tipo: 'curso',
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_conclusao: '',
    instituicao: '',
    comprovante_url: ''
  });

  // Controlar scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const tiposDisponiveis = [
    { value: 'curso', label: 'Curso', pontos: 2 },
    { value: 'certificacao', label: 'Certificação', pontos: 3 },
    { value: 'projeto', label: 'Projeto', pontos: 4 },
    { value: 'conquista', label: 'Conquista', pontos: 5 }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao enviar histórico:', error);
      setError('Erro ao adicionar registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onCancel}
    >
      <div 
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cursor-text-primary">
            Adicionar Registro
          </h2>
          <button
            onClick={onCancel}
            className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors p-2 hover:bg-cursor-background-light rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Tipo de Registro *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
                required
              >
                {tiposDisponiveis.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label} (+{tipo.pontos} pontos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
                placeholder="Ex: Curso de React Avançado"
                maxLength={150}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Instituição/Organização
            </label>
            <input
              type="text"
              name="instituicao"
              value={formData.instituicao}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              placeholder="Ex: Udemy, Coursera, Universidade..."
              maxLength={150}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Data de Início
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                Data de Conclusão
              </label>
              <input
                type="date"
                name="data_conclusao"
                value={formData.data_conclusao}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              URL do Comprovante
            </label>
            <input
              type="url"
              name="comprovante_url"
              value={formData.comprovante_url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              placeholder="https://exemplo.com/certificado.pdf"
            />
            <p className="text-xs text-cursor-text-tertiary mt-2">
              Link para certificado, diploma ou outro comprovante
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all resize-vertical"
              placeholder="Descreva o que foi aprendido, conquistas obtidas ou projetos desenvolvidos..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg" style={{ animation: 'slideIn 0.2s ease-out' }}>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-cursor-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Adicionando...' : 'Adicionar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default HistoricoForm; 