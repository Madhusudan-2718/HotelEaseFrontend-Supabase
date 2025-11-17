import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import housekeepingBanner from "./imagess/housekeep.png";
import { HOUSEKEEPING_STAFF } from "../../data/staffData";

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: string;
  assignedTo: string;
  status: "pending" | "in_progress" | "completed";
  notes: string;
  deadline: string;
  priority: "low" | "medium" | "high";
}

export default function HousekeepingManagement() {
  const { subscribe } = useAppContext();
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [staffMembers, setStaffMembers] = useState<string[]>(HOUSEKEEPING_STAFF);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setTasks([]);
        setStaffMembers(HOUSEKEEPING_STAFF);
      } catch (err) {
        setError("Failed to load tasks. Please try again later.");
        setStaffMembers(HOUSEKEEPING_STAFF);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === "housekeeping_request_created") {
        const newTask = {
          id: event.payload.requestId,
          roomNumber: event.payload.roomNumber,
          taskType: event.payload.serviceType,
          assignedTo: "Unassigned",
          status: "pending" as const,
          notes: event.payload.notes || "",
          deadline: "",
          priority: (event.payload.priority || "medium") as "low" | "medium" | "high",
        };
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === newTask.id);
          return exists ? prev : [newTask, ...prev];
        });
      }
    });
    return unsubscribe;
  }, [subscribe]);

  const handleAssignStaff = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  const handleSubmitAssignment = async (formData: any) => {
    if (selectedTask) {
      try {
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === selectedTask.id
              ? { ...t, ...formData, assignedTo: formData.staff }
              : t
          )
        );
        toast.success(`Task assigned to ${formData.staff}`);
        setIsAssignModalOpen(false);
        setSelectedTask(null);
      } catch {
        toast.error("Failed to assign task. Please try again.");
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => ({
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }[status] || "bg-gray-100 text-gray-800");

  const getPriorityBadge = (priority: string) => ({
    low: "bg-gray-100 text-gray-800",
    medium: "bg-orange-100 text-orange-800",
    high: "bg-red-100 text-red-800",
  }[priority] || "bg-gray-100 text-gray-800");

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 bg-[#F9FAFB] min-h-screen overflow-y-auto">
      {/* ✅ Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-48 sm:h-60 md:h-72 rounded-xl overflow-hidden shadow-lg"
      >
        <img
          src={housekeepingBanner}
          alt="Housekeeping Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative flex flex-col justify-center h-full px-6 sm:px-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] font-playfair mb-2">
            Housekeeping Dashboard
          </h1>
          <p className="text-sm sm:text-lg text-white/90 font-poppins">
            Keep your hotel spotless and your guests smiling
          </p>
        </div>
      </motion.div>

      {/* ✅ Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-2 z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#6B8E23]/30 shadow-lg px-4 sm:px-8 py-3">
          <Input
            placeholder="Search by room, task, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 sm:h-11 rounded-full border-none bg-white/70 px-5 text-sm sm:text-base placeholder:text-gray-500 focus:ring-2 focus:ring-[#6B8E23]/40 transition-all"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] sm:w-[180px] h-10 sm:h-11 rounded-full bg-[#C1DC7D] text-[#2D2D2D] border-none font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border border-[#6B8E23]/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#6B8E23] text-white px-4 sm:px-6 rounded-full shadow-md hover:bg-[#5E7C1E] flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Task List (responsive) */}
      <Card className="border-none shadow-md rounded-2xl p-4 sm:p-6 bg-white">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading tasks...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm sm:text-base">
                  <TableHead>Room</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-gray-50 text-sm sm:text-base"
                  >
                    <TableCell>{task.roomNumber}</TableCell>
                    <TableCell>{task.taskType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {task.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(task.status)}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {task.deadline || "Not set"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAssignStaff(task)}
                        variant="outline"
                        size="sm"
                        className="border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white"
                      >
                        {task.assignedTo === "Unassigned" ? "Assign" : "Reassign"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No tasks found</p>
        )}
      </Card>

      {/* ✅ Assign Staff Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl sm:text-2xl">
              {selectedTask?.assignedTo === "Unassigned"
                ? "Assign Staff"
                : "Reassign Staff"}
            </DialogTitle>
          </DialogHeader>

          {selectedTask ? (
            <AssignStaffForm
              task={selectedTask}
              staffMembers={staffMembers}
              onSubmit={handleSubmitAssignment}
              onCancel={() => {
                setIsAssignModalOpen(false);
                setSelectedTask(null);
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No task selected</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignStaffForm({
  task,
  staffMembers,
  onSubmit,
  onCancel,
}: {
  task: HousekeepingTask;
  staffMembers: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    staff: task.assignedTo === "Unassigned" ? "" : task.assignedTo,
    status: task.status,
    notes: task.notes,
    deadline: task.deadline,
    priority: task.priority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff) return toast.error("Select a staff member");
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div>
        <Label>Room Number</Label>
        <Input value={task.roomNumber} disabled />
      </div>
      <div>
        <Label>Task Type</Label>
        <Input value={task.taskType} disabled />
      </div>
      <div>
        <Label>Assign Staff *</Label>
        <Select
          value={formData.staff}
          onValueChange={(value) => setFormData({ ...formData, staff: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select staff" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((staff) => (
              <SelectItem key={staff} value={staff}>
                {staff}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Deadline</Label>
        <Input
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
        />
      </div>
      <div>
        <Label>Special Notes</Label>
        <Textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any special instructions..."
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D]"
        >
          {task.assignedTo === "Unassigned"
            ? "Assign Task"
            : "Update Assignment"}
        </Button>
      </DialogFooter>
    </form>
  );
}
