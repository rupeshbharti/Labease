import { useState } from 'react';
import { usePhleboTask } from '../context/PhleboTaskContext';
import DutyStatusToggle from '../components/DutyStatusToggle';
import TaskCard from '../components/TaskCard';
import CollectionModal from '../components/CollectionModal';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Navigation, MapPin } from 'lucide-react';

export function TasksPage() {
  const {
    tasks,
    loading,
    isOnline,
    isOffline,
    updatingId,
    loadTasks,
    handleToggleOnline,
    handleUpdateStatus,
    handleDeclineStatus,
    isChecklistOpen,
    selectedTask,
    openCollectionModal,
    closeCollectionModal,
    submitCollectionChecklist,
  } = usePhleboTask();

  const [filter, setFilter] = useState('all');

  if (loading && tasks.length === 0) {
    return <LoadingSpinner text="Retrieving daily tasks..." />;
  }

  const activeTasks = tasks.filter(t => t.status !== 'collected' && t.status !== 'failed');
  const completedTasks = tasks.filter(t => t.status === 'collected');

  const displayedTasks = filter === 'active' 
    ? activeTasks 
    : filter === 'completed' 
    ? completedTasks 
    : tasks;

  const nextActiveTask = activeTasks[0];

  return (
    <div className="phlebo-page-container">
      {/* Schedule Header & Duty Switch */}
      <DutyStatusToggle
        isOnline={isOnline}
        isOffline={isOffline}
        taskCount={activeTasks.length}
        onToggle={handleToggleOnline}
        onRefresh={loadTasks}
      />

      {/* Map Route Context Bar (Stitch Daily Tasks Screen) */}
      {nextActiveTask && (
        <div className="phlebo-map-banner">
          <div className="map-banner-content">
            <div className="map-banner-icon">
              <Navigation size={18} />
            </div>
            <div>
              <span className="map-banner-title">NEXT PATIENT ROUTE</span>
              <p className="map-banner-address">
                {nextActiveTask.bookings?.patient_name || 'Patient'} • {nextActiveTask.bookings?.addresses?.city || 'Location Active'}
              </p>
            </div>
          </div>
          <span className="map-banner-distance flex items-center gap-1">
            <MapPin size={14} />
            2.4 km away
          </span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="phlebo-filter-tabs">
        <button
          className={`phlebo-tab ${filter === 'all' ? 'phlebo-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`phlebo-tab ${filter === 'active' ? 'phlebo-tab--active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({activeTasks.length})
        </button>
        <button
          className={`phlebo-tab ${filter === 'completed' ? 'phlebo-tab--active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className="phlebo-task-list">
        {displayedTasks.length === 0 ? (
          <div className="phlebo-empty-state">
            <p className="title-md">No tasks found</p>
            <p className="body-sm text-secondary">
              {filter === 'active' ? 'You have no pending task assignments right now.' : 'Assignments will appear here when allocated by diagnostic laboratories.'}
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUpdating={updatingId === task.id}
              onUpdateStatus={handleUpdateStatus}
              onDeclineStatus={handleDeclineStatus}
              onOpenChecklist={openCollectionModal}
            />
          ))
        )}
      </div>

      {/* Sample Verification Modal */}
      <CollectionModal
        isOpen={isChecklistOpen}
        onClose={closeCollectionModal}
        task={selectedTask}
        onSubmit={submitCollectionChecklist}
      />
    </div>
  );
}

export default TasksPage;
