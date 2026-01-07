'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import maintenanceService, { 
  MaintenanceTask, 
  MaintenanceFilters, 
  CreateMaintenanceRequest,
  MaintenanceStatus,
  MaintenanceType,
  MaintenancePriority
} from '@/lib/maintenance-service';

export default function ChargerMaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MaintenanceFilters>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  // Stats
  const [stats, setStats] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    totalTasks: 0,
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.listTasks(filters);
      setTasks(response.tasks);
      setTotalPages(response.pages);
      
      // Calculate stats
      const scheduled = response.tasks.filter(t => t.status === 'scheduled').length;
      const inProgress = response.tasks.filter(t => t.status === 'in_progress').length;
      const completed = response.tasks.filter(t => t.status === 'completed').length;
      setStats({
        scheduled,
        inProgress,
        completed,
        totalTasks: response.total,
      });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: MaintenanceStatus) => {
    try {
      if (newStatus === 'completed') {
        await maintenanceService.completeTask(taskId);
      } else if (newStatus === 'in_progress') {
        await maintenanceService.startTask(taskId);
      } else if (newStatus === 'cancelled') {
        await maintenanceService.cancelTask(taskId);
      }
      loadTasks();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: (status || undefined) as MaintenanceStatus | undefined, page: 1 });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      in_progress: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      completed: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      cancelled: 'bg-slate-800/50 border border-slate-700 text-slate-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-800/50 border border-slate-700 text-slate-400',
      medium: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      high: 'bg-orange-950/50 border border-orange-800 text-orange-400',
      critical: 'bg-red-950/50 border border-red-800 text-red-400',
    };
    return colors[priority] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Maintenance Management</h1>
          <button 
            onClick={() => { setSelectedTask(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Maintenance
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Total Tasks</div>
            <div className="text-2xl font-bold text-slate-100">{stats.totalTasks}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Scheduled</div>
            <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">In Progress</div>
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Completed</div>
            <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => handleStatusFilter(e.target.value)}
            value={filters.status || ''}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setFilters({ ...filters, priority: (e.target.value || undefined) as MaintenancePriority | undefined, page: 1 })}
            value={filters.priority || ''}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <MaintenanceForm
            task={selectedTask}
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); loadTasks(); }}
          />
        )}

        {/* Tasks Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-slate-100">Maintenance Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Charger/Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No maintenance tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-100">{task.title}</div>
                        <div className="text-sm text-slate-400">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        <div>{task.chargerName || task.chargerId}</div>
                        <div className="text-xs text-slate-400">{task.stationName || task.stationId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100 capitalize">
                        {task.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {formatDate(task.scheduledDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {task.status === 'scheduled' && (
                          <button 
                            onClick={() => handleStatusChange(task._id, 'in_progress')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button 
                            onClick={() => handleStatusChange(task._id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        )}
                        {(task.status === 'scheduled' || task.status === 'in_progress') && (
                          <button 
                            onClick={() => handleStatusChange(task._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Maintenance Form Component
function MaintenanceForm({ 
  task, 
  onClose, 
  onSuccess 
}: { 
  task: MaintenanceTask | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMaintenanceRequest>({
    chargerId: task?.chargerId || '',
    stationId: task?.stationId || '',
    type: task?.type || 'preventive',
    priority: task?.priority || 'medium',
    title: task?.title || '',
    description: task?.description || '',
    scheduledDate: task?.scheduledDate ? task.scheduledDate.slice(0, 16) : '',
    assignedTo: task?.assignedTo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await maintenanceService.createTask({
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      });
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Schedule Maintenance</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Routine Inspection"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Describe the maintenance task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Charger ID *
              </label>
              <input
                type="text"
                required
                value={formData.chargerId}
                onChange={(e) => setFormData({ ...formData, chargerId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Charger ID or Mongo _id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Station ID *
              </label>
              <input
                type="text"
                required
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Station ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Assigned To (optional)
            </label>
            <input
              type="text"
              value={formData.assignedTo || ''}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Technician name or ID"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
