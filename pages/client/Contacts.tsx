import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Filter,
  X,
  Trash2,
  Edit2,
  Phone,
  Mail,
  User,
  Building2,
  MapPin,
  Briefcase,
  Loader2,
  Upload,
} from "lucide-react";
import { db, auth, appId } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import ConfirmModal, { ConfirmModalType } from "../../components/ConfirmModal";

// --- Interfaces ---
interface Organization {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ContactPerson {
  id: string;
  organizationId: string; // Link to Organization
  organizationName?: string; // For display
  name: string;
  role: string;
  sector: string;
  email: string;
  phone: string;
}

interface IndividualClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const Contacts = () => {
  const [activeTab, setActiveTab] = useState<
    "organizations" | "contacts" | "individuals"
  >("organizations");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [individuals, setIndividuals] = useState<IndividualClient[]>([]);

  // Modals
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);

  // Forms
  const [orgForm, setOrgForm] = useState<Partial<Organization>>({});
  const [contactForm, setContactForm] = useState<Partial<ContactPerson>>({});
  const [individualForm, setIndividualForm] = useState<
    Partial<IndividualClient>
  >({});

  // Fetch Data
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const unsubOrg = onSnapshot(
      collection(db, "artifacts", appId, "users", uid, "organizations"),
      (snap) => {
        setOrganizations(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Organization))
        );
      }
    );

    const unsubContact = onSnapshot(
      collection(db, "artifacts", appId, "users", uid, "contacts"),
      (snap) => {
        setContacts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactPerson))
        );
      }
    );

    const unsubInd = onSnapshot(
      collection(db, "artifacts", appId, "users", uid, "individuals"),
      (snap) => {
        setIndividuals(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as IndividualClient))
        );
        setIsLoading(false);
      }
    );

    return () => {
      unsubOrg();
      unsubContact();
      unsubInd();
    };
  }, []);

  // Handlers
  const handleSaveOrg = async () => {
    if (!auth.currentUser) return;
    await addDoc(
      collection(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "organizations"
      ),
      orgForm
    );
    setIsOrgModalOpen(false);
    setOrgForm({});
  };

  const handleSaveContact = async () => {
    if (!auth.currentUser) return;
    // Find org name for display
    const org = organizations.find((o) => o.id === contactForm.organizationId);
    await addDoc(
      collection(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "contacts"
      ),
      {
        ...contactForm,
        organizationName: org?.fantasyName || "N/A",
      }
    );
    setIsContactModalOpen(false);
    setContactForm({});
  };

  const handleSaveIndividual = async () => {
    if (!auth.currentUser) return;
    await addDoc(
      collection(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "individuals"
      ),
      individualForm
    );
    setIsIndividualModalOpen(false);
    setIndividualForm({});
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!auth.currentUser) return;
    if (confirm("Tem certeza?")) {
      await deleteDoc(
        doc(
          db,
          "artifacts",
          appId,
          "users",
          auth.currentUser.uid,
          collectionName,
          id
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Clientes
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
            <Upload size={16} /> Importar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: "organizations", label: "Organizações" },
            { id: "contacts", label: "Contatos" },
            { id: "individuals", label: "Clientes Pessoa Física" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Organizações
              </h3>
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
              >
                <Plus size={16} /> Novo Organização
              </button>
            </div>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center group transition"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase">
                      {org.fantasyName || org.socialReason}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CNPJ: {org.cnpj}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("organizations", org.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {organizations.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma organização cadastrada.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Contatos
              </h3>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
              >
                <Plus size={16} /> Novo Contato
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center group transition"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {contact.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {contact.role || "Cargo não inf."} |{" "}
                      {contact.organizationName}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="text-gray-400 hover:text-indigo-500">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete("contacts", contact.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum contato cadastrado.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Individuals Tab */}
        {activeTab === "individuals" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Clientes Pessoa Física
              </h3>
              <button
                onClick={() => setIsIndividualModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
              >
                <Plus size={16} /> Novo Cliente PF
              </button>
            </div>
            <div className="space-y-3">
              {individuals.map((ind) => (
                <div
                  key={ind.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center group transition"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase">
                      {ind.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CPF: {ind.cpf}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("individuals", ind.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {individuals.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum cliente PF cadastrado.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Modal Nova Organização */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-2xl p-6 relative my-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Nova Organização
            </h3>
            <button
              onClick={() => setIsOrgModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CNPJ
                </label>
                <div className="relative">
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="00.000.000/0000-00"
                    value={orgForm.cnpj}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, cnpj: e.target.value })
                    }
                  />
                  <Search
                    size={16}
                    className="absolute right-3 top-3 text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Fantasia*
                </label>
                <input
                  className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={orgForm.fantasyName}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, fantasyName: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Razão Social
                </label>
                <input
                  className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={orgForm.socialReason}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, socialReason: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={orgForm.cep}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, cep: e.target.value })
                      }
                    />
                    <Search
                      size={16}
                      className="absolute right-3 top-3 text-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logradouro
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.address}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.number}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, number: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Complemento
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.complement}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, complement: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bairro
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.neighborhood}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, neighborhood: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cidade
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.city}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={orgForm.state}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, state: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrg}
                className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Contato */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl p-6 relative">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Novo Contato
            </h3>
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organização*
                </label>
                <select
                  className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={contactForm.organizationId}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      organizationId: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.fantasyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome*
                </label>
                <input
                  className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cargo
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={contactForm.role}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Setor
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={contactForm.sector}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, sector: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveContact}
                className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente PF */}
      {isIndividualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-2xl p-6 relative my-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Novo Cliente PF
            </h3>
            <button
              onClick={() => setIsIndividualModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome*
                </label>
                <input
                  className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={individualForm.name}
                  onChange={(e) =>
                    setIndividualForm({
                      ...individualForm,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={individualForm.email}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={individualForm.phone}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPF
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={individualForm.cpf}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        cpf: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={individualForm.birthDate}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        birthDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Endereço PF (Simplificado para caber no exemplo, mas segue a lógica do Org) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={individualForm.cep}
                      onChange={(e) =>
                        setIndividualForm({
                          ...individualForm,
                          cep: e.target.value,
                        })
                      }
                    />
                    <Search
                      size={16}
                      className="absolute right-3 top-3 text-indigo-600"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logradouro
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={individualForm.address}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsIndividualModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveIndividual}
                className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
