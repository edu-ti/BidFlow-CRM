import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  DollarSign,
  Loader2,
  Trash2,
} from "lucide-react";
import { Deal, FunnelStage } from "../../types";
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

// Stages can also be dynamic, but let's keep them static for now
const initialStages: FunnelStage[] = [
  { id: "s1", name: "Novo Lead", color: "bg-blue-500" },
  { id: "s2", name: "Em Contato", color: "bg-yellow-500" },
  { id: "s3", name: "Proposta Enviada", color: "bg-purple-500" },
  { id: "s4", name: "Fechado", color: "bg-green-500" },
];

const Funnel = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    contactName: "",
  });

  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: ConfirmModalType;
    onConfirm?: () => void;
    confirmText?: string;
    showCancel?: boolean;
  }>({
    title: "",
    message: "",
    type: "info",
  });

  // Firestore Subscription
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "artifacts", appId, "users", auth.currentUser.uid, "deals")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDeals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Deal[];
      setDeals(fetchedDeals);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId || !auth.currentUser) return;

    // Optimistic Update (Immediate UI change)
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageId } : d))
    );

    // Persist to Firestore
    try {
      const dealDoc = doc(
        db,
        "artifacts",
        appId,
        "users",
        auth.currentUser.uid,
        "deals",
        dealId
      );
      await updateDoc(dealDoc, { stageId });
    } catch (error) {
      console.error("Failed to move deal:", error);
      // Revert on error would go here
    }
  };

  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.value || !auth.currentUser) return;

    try {
      await addDoc(
        collection(
          db,
          "artifacts",
          appId,
          "users",
          auth.currentUser.uid,
          "deals"
        ),
        {
          title: newDeal.title,
          value: Number(newDeal.value),
          contactName: newDeal.contactName,
          stageId: "s1", // Default stage
          createdAt: new Date().toISOString(),
        }
      );
      setIsModalOpen(false);
      setNewDeal({ title: "", value: "", contactName: "" });
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  const handleDeleteDeal = (id: string) => {
    if (!auth.currentUser) return;

    setConfirmConfig({
      title: "Excluir Negócio",
      message: "Tem certeza que deseja excluir este negócio?",
      type: "error",
      confirmText: "Excluir",
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteDoc(
            doc(
              db,
              "artifacts",
              appId,
              "users",
              auth.currentUser!.uid,
              "deals",
              id
            )
          );
        } catch (e) {
          console.error("Error deleting deal:", e);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Funil de Vendas
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> Novo Negócio
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {initialStages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            const totalValue = stageDeals.reduce(
              (acc, curr) => acc + curr.value,
              0
            );

            return (
              <div
                key={stage.id}
                className="min-w-[300px] flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 border border-transparent dark:border-gray-700"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="flex justify-between items-center mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${stage.color}`}
                    ></div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                      {stage.name}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">
                      {stageDeals.length}
                    </span>
                  </div>
                  <MoreHorizontal
                    size={16}
                    className="text-gray-400 cursor-pointer"
                  />
                </div>

                <div className="mb-3 px-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total Estimado
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    R$ {totalValue.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar min-h-[100px]">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition group relative"
                    >
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase rounded">
                          Negócio
                        </span>
                        <GripVertical
                          size={14}
                          className="text-gray-300 dark:text-gray-600"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {deal.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {deal.contactName}
                      </p>
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium text-sm">
                        <DollarSign size={14} />
                        {deal.value.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Novo Negócio
            </h3>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Título (ex: Contrato Anual)"
                value={newDeal.title}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, title: e.target.value })
                }
              />
              <input
                className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Valor (apenas números)"
                type="number"
                value={newDeal.value}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, value: e.target.value })
                }
              />
              <input
                className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Nome do Cliente"
                value={newDeal.contactName}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, contactName: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDeal}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        confirmText={confirmConfig.confirmText}
        showCancel={confirmConfig.showCancel}
      />
    </div>
  );
};

export default Funnel;
