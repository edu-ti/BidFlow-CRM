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
  Loader2,
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

interface ContactData {
  id: string; // ID agora é string (do Firestore)
  name: string;
  phone: string;
  email: string;
  tags: string[];
}

const Contacts = () => {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<ContactData>>({
    name: "",
    phone: "",
    email: "",
    tags: [],
  });

  // Actions Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Firestore Subscription
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "contacts"
      ),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedContacts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContactData[];
        setContacts(fetchedContacts);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching contacts:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSaveContact = async () => {
    if (!newContact.name || !newContact.phone || !auth.currentUser) return;

    try {
      const contactsRef = collection(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "contacts"
      );

      if (editingId) {
        // Update existing contact
        const contactDoc = doc(
          db,
          "artifacts",
          appId,
          "users",
          auth.currentUser.uid,
          "contacts",
          editingId
        );
        await updateDoc(contactDoc, {
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email || "",
          tags: newContact.tags || [],
        });
      } else {
        // Create new contact
        await addDoc(contactsRef, {
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email || "",
          tags: newContact.tags || ["Novo"],
          createdAt: new Date().toISOString(),
        });
      }

      setIsModalOpen(false);
      setNewContact({ name: "", phone: "", email: "", tags: [] });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Erro ao salvar contato. Tente novamente.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!auth.currentUser) return;
    if (confirm("Tem certeza que deseja excluir este contato?")) {
      try {
        await deleteDoc(
          doc(
            db,
            "artifacts",
            appId,
            "users",
            auth.currentUser.uid,
            "contacts",
            id
          )
        );
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  const handleEditContact = (contact: ContactData) => {
    setNewContact({ ...contact });
    setEditingId(contact.id);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenNewContactModal = () => {
    setNewContact({ name: "", phone: "", email: "", tags: [] });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Contatos</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition ${
              showFilters
                ? "bg-gray-100 border-gray-400 text-gray-900"
                : "border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Filter size={18} /> Filtros
          </button>
          <button
            onClick={handleOpenNewContactModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
          >
            <Plus size={18} /> Novo Contato
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Etiquetas</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === contact.id ? null : contact.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === contact.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          <div className="absolute right-6 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 size={14} /> Editar Contato
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Excluir
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New/Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">
                {editingId ? "Editar Contato" : "Novo Contato"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Ex: Maria Silva"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp)
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+55 11 99999-9999"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="maria@exemplo.com"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Cliente, VIP, SP"
                  value={newContact.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveContact}
                disabled={!newContact.name || !newContact.phone}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? "Salvar Alterações" : "Salvar Contato"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
