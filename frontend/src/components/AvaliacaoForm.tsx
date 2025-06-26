import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { AvaliacaoInput, CategoriaAvaliacao } from '../types';
import { avaliacoesService } from '../services/avaliacoes';

interface AvaliacaoFormProps {
  jovemId: number;
  onSubmit: (avaliacao: AvaliacaoInput) => Promise<void>;
  onCancel: () => void;
}

export const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  jovemId,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [categorias, setCategorias] = useState<CategoriaAvaliacao[]>([]);
  
  const [formData, setFormData] = useState<AvaliacaoInput>({
    categoria_id: 0,
    nota: 7.0, // Valor padrão
    comentario: '',
    evidencias: [] // Ensure it's always an array
  });

  // Controlar scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Carregar categorias de avaliação
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await avaliacoesService.obterCategorias();
        setCategorias(data);
        
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setError('Erro ao carregar categorias de avaliação');
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nota' || name === 'categoria_id' ? Number(value) : value
    }));
  };

  const handleEvidenciaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const evidencias = e.target.value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');
    
    setFormData(prev => ({ ...prev, evidencias: evidencias.length > 0 ? evidencias : [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setError('Erro ao enviar avaliação. Tente novamente.');
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
        className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cursor-text-primary">
            Nova Avaliação
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
          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Categoria
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Nota (0-10)
            </label>
            <input
              type="number"
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.5"
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Comentário
            </label>
            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all resize-vertical"
              placeholder="Descreva os motivos da sua avaliação..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
              Evidências (uma por linha)
            </label>
            <textarea
              value={formData.evidencias?.join('\n')}
              onChange={handleEvidenciaChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-cursor-border bg-cursor-background-light text-cursor-text-primary focus:border-cursor-primary focus:ring-2 focus:ring-cursor-primary/20 transition-all resize-vertical"
              placeholder="https://exemplo.com/evidencia1&#10;https://exemplo.com/evidencia2"
            />
            <p className="text-xs text-cursor-text-tertiary mt-2">
              Adicione links para documentos, projetos ou certificados
            </p>
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
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AvaliacaoForm; 