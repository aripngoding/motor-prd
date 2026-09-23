import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  X, 
  Wrench, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { ServiceCategory, PartUsage, InspectionChecklist } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_MOTOR_PRESETS = [
  'Yamaha NMAX 155 Connected',
  'Honda Vario 160 eSP+',
  'Honda PCX 160 ABS',
  'Honda Beat Street 2024',
  'Yamaha Aerox 155 VVA',
  'Kawasaki Ninja 250 FI',
  'Honda Scoopy Prestige',
  'Vespa Sprint 150 i-Get'
];

export const NewServiceModal: React.FC<NewServiceModalProps> = ({ isOpen, onClose }) => {
  const { addService, inventory, employees } = useWorkshop();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [motorModel, setMotorModel] = useState(COMMON_MOTOR_PRESETS[0]);
  const [customMotor, setCustomMotor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Servis Berkala');
  const [complaints, setComplaints] = useState('');
  const [bayNumber, setBayNumber] = useState<number>(1);
  const [mechanicId, setMechanicId] = useState<string>(employees[1]?.id || employees[0]?.id || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [laborCost, setLaborCost] = useState(75000);
  const [notes, setNotes] = useState('');

  // Selected Parts
  const [selectedParts, setSelectedParts] = useState<PartUsage[]>([]);
  const [selectedPartIdToAdd, setSelectedPartIdToAdd] = useState('');
  const [partQtyToAdd, setPartQtyToAdd] = useState(1);

  // Inspection Checklist
  const [checklist, setChecklist] = useState<InspectionChecklist>({
    oliMesin: false,
    busiPengapian: true,
    sistemRem: false,
    cvtRantai: false,
    filterUdara: true,
    akiKelistrikan: true,
    tekananBan: true,
    radiatorCoolant: true
  });

  if (!isOpen) return null;

  const activeMechanics = employees.filter(e => e.role.includes('Mekanik') || e.role.includes('Bengkel'));

  const handleAddPartToOrder = () => {
    if (!selectedPartIdToAdd) return;
    const foundPart = inventory.find(p => p.id === selectedPartIdToAdd);
    if (!foundPart) return;

    if (foundPart.stock < partQtyToAdd) {
      alert(`Stok tidak mencukupi! Stok ${foundPart.name} tersisa ${foundPart.stock} ${foundPart.unit}.`);
      return;
    }

    const existingIdx = selectedParts.findIndex(p => p.partId === foundPart.id);
    if (existingIdx >= 0) {
      const updated = [...selectedParts];
      updated[existingIdx].quantity += partQtyToAdd;
      setSelectedParts(updated);
    } else {
      setSelectedParts(prev => [
        ...prev,
        {
          partId: foundPart.id,
          sku: foundPart.sku,
          name: foundPart.name,
          quantity: partQtyToAdd,
          price: foundPart.sellPrice
        }
      ]);
    }

    setSelectedPartIdToAdd('');
    setPartQtyToAdd(1);
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(p => p.partId !== partId));
  };

  const toggleChecklist = (key: keyof InspectionChecklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const partsTotalCost = selectedParts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const grandTotal = laborCost + partsTotalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !plateNumber) {
      alert('Mohon lengkapi Nama Pelanggan dan Nomor Polisi motor!');
      return;
    }

    const finalMotor = motorModel === 'Lainnya' ? customMotor || 'Motor Umum' : motorModel;
    const assignedMech = employees.find(e => e.id === mechanicId);
    const mechanicName = assignedMech ? `${assignedMech.name} (${assignedMech.role})` : 'Mekanik Bengkel';

    addService({
      customerName,
      customerPhone: customerPhone || '0812-xxxx-xxxx',
      motorModel: finalMotor,
      plateNumber: plateNumber.toUpperCase(),
      serviceCategory,
      complaints: complaints || 'Pemeriksaan rutin berkala & pemeliharaan standar.',
      bayNumber: Number(bayNumber),
      mechanicId,
      mechanicName,
      status: 'Pengerjaan',
      estimatedMinutes: Number(estimatedMinutes),
      laborCost: Number(laborCost),
      partsUsed: selectedParts,
      checklist,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-600">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Booking & Registrasi Servis Motor Baru
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan keluhan, assignment mekanik, alokasi bay, dan suku cadang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Section 1: Customer & Bike Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pelanggan <span className="text-sky-600">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipe & Model Motor
              </label>
              <select
                value={motorModel}
                onChange={e => setMotorModel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                {COMMON_MOTOR_PRESETS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="Lainnya">Model Lainnya...</option>
              </select>
              {motorModel === 'Lainnya' && (
                <input
                  type="text"
                  placeholder="Ketik model motor..."
                  value={customMotor}
                  onChange={e => setCustomMotor(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Polisi (Plat) <span className="text-sky-600">*</span>
              </label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                placeholder="B 1234 XYZ"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold uppercase text-sky-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Section 2: Service Category & Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Servis
              </label>
              <select
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value="Servis Ringan">Servis Ringan</option>
                <option value="Servis Berkala">Servis Berkala</option>
                <option value="Ganti Oli & Tune Up">Ganti Oli & Tune Up</option>
                <option value="Sistem Rem & CVT">Sistem Rem & CVT</option>
                <option value="Turun Mesin & Kelistrikan">Turun Mesin & Kelistrikan</option>
                <option value="Overhaul Suspensi">Overhaul Suspensi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bay Servis
              </label>
              <select
                value={bayNumber}
                onChange={e => setBayNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value={1}>Bay 1 (Lift Hidrolik A)</option>
                <option value={2}>Bay 2 (Lift Hidrolik B)</option>
                <option value={3}>Bay 3 (Pit Diagnosa Injeksi)</option>
                <option value={4}>Bay 4 (Area Tune Up Cepat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mekanik Penanggung Jawab
              </label>
              <select
                value={mechanicId}
                onChange={e => setMechanicId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                {activeMechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.name} - {m.role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Complaints */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keluhan & Indikasi Masalah Pelanggan
            </label>
            <textarea
              rows={2}
              value={complaints}
              onChange={e => setComplaints(e.target.value)}
              placeholder="Contoh: Mesin brebet pada putaran bawah, rem depan decit, ganti oli mesin dan oli gardan."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          {/* Section 4: 8-Point Inspection Checklist */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3">
            <div className="text-xs font-bold text-sky-800 mb-2 flex items-center gap-1.5">
              <span>Lembar Cek Fisik Standar (8-Point Inspection)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { key: 'oliMesin', label: '1. Oli Mesin / Pelumas' },
                { key: 'sistemRem', label: '2. Sistem Rem (Depan/Belakang)' },
                { key: 'busiPengapian', label: '3. Busi & Pengapian' },
                { key: 'cvtRantai', label: '4. V-Belt & CVT / Rantai' },
                { key: 'filterUdara', label: '5. Filter Udara & Throttle' },
                { key: 'akiKelistrikan', label: '6. Tegangan Aki & Starter' },
                { key: 'tekananBan', label: '7. Tekanan & Alur Ban' },
                { key: 'radiatorCoolant', label: '8. Radiator / Pendingin' }
              ].map(item => {
                const checked = checklist[item.key as keyof InspectionChecklist];
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => toggleChecklist(item.key as keyof InspectionChecklist)}
                    className={`flex items-center gap-2 rounded-lg p-2 text-left transition-colors ${
                      checked 
                        ? 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="h-4 w-4 text-sky-600 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Pick Suku Cadang (Inventory Linked) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>Alokasi Suku Cadang dari Gudang</span>
                <span className="text-[10px] text-sky-600 font-normal">(Stok terpotong otomatis saat pengerjaan)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <select
                value={selectedPartIdToAdd}
                onChange={e => setSelectedPartIdToAdd(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              >
                <option value="">-- Pilih Suku Cadang dari Inventaris --</option>
                {inventory.map(part => (
                  <option 
                    key={part.id} 
                    value={part.id}
                    disabled={part.stock <= 0}
                  >
                    {part.name} - Stok: {part.stock} {part.unit} ({formatRupiah(part.sellPrice)})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={partQtyToAdd}
                  onChange={e => setPartQtyToAdd(Math.max(1, Number(e.target.value)))}
                  className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-center font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPartToOrder}
                  disabled={!selectedPartIdToAdd}
                  className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Part
                </button>
              </div>
            </div>

            {/* List of allocated parts */}
            {selectedParts.length > 0 ? (
              <div className="space-y-1.5 mt-2">
                {selectedParts.map(item => (
                  <div 
                    key={item.partId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-sky-700 font-bold bg-sky-100 px-1 py-0.5 rounded">{item.sku}</span>
                      <span className="text-slate-800 font-medium truncate">{item.name}</span>
                      <span className="text-slate-500">({item.quantity}x @ {formatRupiah(item.price)})</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-sky-700">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(item.partId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Belum ada suku cadang yang dialokasikan.</p>
            )}
          </div>

          {/* Section 6: Biaya & Ringkasan */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biaya Jasa Servis (Rp)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={laborCost}
                  onChange={e => setLaborCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimasi Durasi (Menit)
                </label>
                <input
                  type="number"
                  step={5}
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(Math.max(10, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-sky-500/10 border border-sky-300 p-2 text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Estimasi Biaya</span>
                <span className="text-base font-extrabold font-mono text-sky-800">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
            >
              <Wrench className="h-4 w-4" />
              <span>Simpan & Masukkan Antrean Servis</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
