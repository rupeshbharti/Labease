import { useState } from 'react';
import { usePhleboTask } from '../context/PhleboTaskContext';
import DutyStatusToggle from '../components/DutyStatusToggle';
import TaskCard from '../components/TaskCard';
import CollectionModal from '../components/CollectionModal';
import LoadingSpinner from '../../shared/LoadingSpinner';

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
    return <LoadingSpinner text="Retrieving task assignments..." />;
  }

  const activeTasks = tasks.filter(t => t.status !== 'collected' && t.status !== 'failed');
  const completedTasks = tasks.filter(t => t.status === 'collected');

  const displayedTasks = filter === 'active' 
    ? activeTasks 
    : filter === 'completed' 
    ? completedTasks 
    : tasks;

  return (
    <div className="phlebo-page-container">
      <DutyStatusToggle
        isOnline={isOnline}
        isOffline={isOffline}
        taskCount={activeTasks.length}
        onToggle={handleToggleOnline}
        onRefresh={loadTasks}
      />

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
              {filter === 'active' ? 'You have no active pending task assignments right now.' : 'Assignments will appear here when allocated by diagnostic labs.'}
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
