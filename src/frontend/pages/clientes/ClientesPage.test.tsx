import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import * as clientExportService from '@/services/clientExportService';
import * as clientService from '@/services/clientService';
import type { Client, Project } from '@/types';
import ClientesPage from './ClientesPage';

const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
const mockConfirm = vi.spyOn(window, 'confirm').mockImplementation(() => true);

const defaultAddress: Client['address'] = {
  street: 'Rua A',
  number: '10',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zip: '01000-000',
};

const mockClients: Client[] = [
  {
    id: 'client-active-1',
    name: 'Alpha Corp',
    contacts: [{ id: 'contact-1', phone: '(11) 99999-0000', hasWhatsApp: true, isPrimary: true }],
    status: 'Cliente Ativo',
    serviceInterests: [],
    address: defaultAddress,
    cpfCnpj: '12345678901',
    isFavorite: false,
    isUrgent: false,
    registrationDate: '2026-01-01',
    lastContactDate: '2026-01-02',
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  },
  {
    id: 'client-active-2',
    name: 'Beta Services',
    contacts: [{ id: 'contact-2', phone: '(11) 98888-0000', hasWhatsApp: false, isPrimary: true }],
    status: 'Potencial Cliente',
    serviceInterests: [],
    address: defaultAddress,
    isFavorite: true,
    isUrgent: true,
    registrationDate: '2026-01-01',
    lastContactDate: '2026-01-02',
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  },
  {
    id: 'client-archived',
    name: 'Omega Ltd',
    contacts: [],
    status: 'Cliente Desabilitado',
    serviceInterests: [],
    address: defaultAddress,
    isFavorite: false,
    registrationDate: '2026-01-01',
    lastContactDate: '2026-01-02',
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: true,
  },
];

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    code: 'PRJ-001',
    name: 'Projeto Alpha',
    clientName: 'Alpha Corp',
    clientId: 'client-active-1',
    status: 'Em Andamento',
    deadline: null,
    budget: 0,
    description: '',
    sections: [],
    archived: false,
    financials: {
      paymentType: 'vista',
      totalValue: 0,
      baseContractValue: 0,
      lumpSumStatus: 'Em aberto',
    },
  },
];

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <DataProvider>
        <ClientesPage />
      </DataProvider>
    </MemoryRouter>,
  );
};

const mockFileReaderReadAsText = (result: string) => {
  return vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function readAsTextMock(
    this: FileReader,
  ) {
    const onloadHandler = this.onload;
    if (typeof onloadHandler === 'function') {
      const event = { target: { result } } as unknown as ProgressEvent<FileReader>;
      onloadHandler.call(this, event);
    }
  });
};

describe('ClientesPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      clients: [...mockClients],
      projects: [...mockProjects],
      proposals: [],
      agendaEvents: [],
    });

    mockAlert.mockClear();
    mockConfirm.mockClear();
    vi.clearAllMocks();
    vi.spyOn(clientExportService, 'exportClients').mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  describe('Navegação e Vistas', () => {
    it('deve alternar entre clientes ativos e arquivados', () => {
      renderComponent();

      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta Services')).toBeInTheDocument();
      expect(screen.queryByText('Omega Ltd')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Ver Arquivados/i }));

      expect(screen.getByText('Omega Ltd')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Corp')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Ver Ativos/i }));
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
    });

    it('deve abrir o modal de gerenciamento de dados', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Dados/i }));
      expect(screen.getByText('Gerenciamento de Dados')).toBeInTheDocument();
    });

    it('deve abrir o modal de formulário para adicionar cliente', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Cliente/i }));
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    });
  });

  describe('Filtros e Busca', () => {
    it('deve filtrar clientes por texto (nome, CPF, cidade ou telefone)', () => {
      renderComponent();

      const searchInput = screen.getByPlaceholderText(
        'Busca por nome ou CPF/CNPJ',
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: 'Alpha' } });
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta Services')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: '123456789' } });
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Paulo' } });
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: '0000' } });
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta Services')).toBeInTheDocument();
    });

    it('deve filtrar por status do cliente', () => {
      renderComponent();

      const statusSelect = screen.getByRole('combobox', { name: /filtrar por status/i });
      fireEvent.change(statusSelect, { target: { value: 'Cliente Ativo' } });

      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta Services')).not.toBeInTheDocument();
    });
  });

  describe('Ações de Tabela e Massa (Bulk Actions)', () => {
    it('deve selecionar todos os clientes da página e desselecionar', () => {
      renderComponent();

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      const bulkArchiveButton = screen.getByRole('button', {
        name: /Arquivar clientes selecionados/i,
      });
      expect(bulkArchiveButton).toBeInTheDocument();

      fireEvent.click(selectAllCheckbox);
      expect(
        screen.queryByRole('button', { name: /Arquivar clientes selecionados/i }),
      ).not.toBeInTheDocument();
    });

    it('deve alternar a propriedade urgente de um cliente', async () => {
      renderComponent();

      const urgentButtons = screen.getAllByRole('button', { name: /Marcar Urgência/i });
      fireEvent.click(urgentButtons[0]);

      await waitFor(() => {
        expect(urgentButtons[0]).toBeInTheDocument();
      });
    });

    it('deve arquivar clientes selecionados em massa e seus respectivos projetos', async () => {
      renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]);

      fireEvent.click(screen.getByRole('button', { name: /Arquivar clientes selecionados/i }));

      await waitFor(() => {
        expect(screen.queryByText('Alpha Corp')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Beta Services')).toBeInTheDocument();

      const data = api.getData();
      const project = data.projects.find((item) => item.id === 'proj-1');
      expect(project?.archived).toBe(true);
    });

    it('deve recusar a exclusão em massa se o cliente possuir projetos', async () => {
      renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]);

      fireEvent.click(screen.getByRole('button', { name: /Excluir clientes selecionados/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('projetos vinculados e não podem ser excluídos'),
        );
      });
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
    });

    it('deve excluir clientes em massa se não houverem projetos vinculados', async () => {
      renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      fireEvent.click(screen.getByRole('button', { name: /Excluir clientes selecionados/i }));

      await waitFor(() => {
        expect(screen.queryByText('Beta Services')).not.toBeInTheDocument();
      });
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('Integração com Formulário de Cliente', () => {
    it('deve tratar evento de salvar e erro de duplicidade', () => {
      vi.spyOn(clientService, 'saveClientAndUpdateState').mockReturnValue({
        error: 'duplicate_cpf_cnpj',
        updatedClients: [],
      });

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Cliente/i }));

      const nameInput = screen.getByLabelText(/Nome Completo/i);
      fireEvent.change(nameInput, { target: { value: 'Novo Cliente' } });
      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(screen.getByText('Cliente Duplicado')).toBeInTheDocument();
      expect(screen.getByText(/Já existe um cliente com este CPF/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Entendi/i }));
      expect(screen.queryByText('Cliente Duplicado')).not.toBeInTheDocument();
    });

    it('deve tratar evento de salvar e alerta de CPF inválido', () => {
      vi.spyOn(clientService, 'saveClientAndUpdateState').mockReturnValue({
        error: 'invalid_cpf_cnpj',
        updatedClients: [],
      });

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Cliente/i }));
      fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Novo' } });
      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(mockAlert).toHaveBeenCalledWith('CPF/CNPJ inválido. Verifique os dígitos informados.');
    });

    it('deve salvar com sucesso e atualizar estado', () => {
      const newClient = { ...mockClients[0], id: 'novo-id' };
      vi.spyOn(clientService, 'saveClientAndUpdateState').mockReturnValue({
        updatedClients: [...mockClients, newClient],
      });

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Cliente/i }));
      fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Novo' } });
      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(screen.queryByText('Novo Cliente')).not.toBeInTheDocument();
    });
  });

  describe('Exportação e Importação de Dados', () => {
    it('deve exportar todos os clientes em JSON', async () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Dados/i }));
      fireEvent.click(screen.getByRole('button', { name: /JSON/i }));

      await waitFor(() => {
        expect(clientExportService.exportClients).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Array),
          'JSON',
        );
      });
    });

    it('deve usar FileReader para importar JSON', () => {
      const readAsTextSpy = mockFileReaderReadAsText(
        '[{"id":"imported","name":"Imported Client","status":"Cliente Ativo"}]',
      );

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Dados/i }));
      fireEvent.click(screen.getByRole('button', { name: /Importar Backup/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['{"test":"import"}'], 'test.json', { type: 'application/json' })],
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Confirmar Importação/i }));

      expect(readAsTextSpy).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('Lista de clientes atualizada com sucesso!');

      readAsTextSpy.mockRestore();
    });

    it('deve tratar erro na importação de JSON', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Dados/i }));
      fireEvent.click(screen.getByRole('button', { name: /Importar Backup/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, {
        target: { files: [new File(['{}'], 'test.json')] },
      });

      const importClientsSpy = vi.spyOn(api, 'importClients').mockImplementationOnce(() => {
        throw new Error('Bad format');
      });
      const readAsTextSpy = mockFileReaderReadAsText('bad json');

      fireEvent.click(screen.getByRole('button', { name: /Confirmar Importação/i }));

      expect(importClientsSpy).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao importar arquivo JSON: Error: Bad format'),
      );

      readAsTextSpy.mockRestore();
      importClientsSpy.mockRestore();
    });
  });
});
