import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  Upload,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  description: string;
  price: number;
  unit: string;
  image: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "CARDIOVERSOR",
    model: "CARDIOMAX LITE",
    description: "Equipamento completo...",
    manufacturer: "INSTRAMED",
    price: 23082.0,
    unit: "Unidade",
    image: "",
  },
  {
    id: "2",
    name: "DESFIBRILADOR",
    model: "APOLUS",
    description: "...",
    manufacturer: "INSTRAMED",
    price: 12569.0,
    unit: "Unidade",
    image: "",
  },
];

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Produtos
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between gap-2 min-w-[160px]">
            Todos Fornecedores <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition whitespace-nowrap"
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Imagem</th>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3">Fabricante</th>
                <th className="px-6 py-3">Valor Unitário</th>
                <th className="px-6 py-3">Unidade</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                      <span className="text-xs text-gray-400">IMG</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white uppercase">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {product.model}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 uppercase font-medium">
                    {product.manufacturer}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-xl shadow-2xl p-6 relative my-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Novo Produto no Catálogo
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Produto*
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fabricante
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newProduct.manufacturer}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Modelo
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newProduct.model}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, model: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição Detalhada
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor Unitário*
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="R$ 0,00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unidade de Medida
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newProduct.unit}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, unit: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Upload Imagem */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagem
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm font-medium">Escolher Imagem</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
