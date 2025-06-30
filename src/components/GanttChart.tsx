
'use client'

import React, { useState, useEffect } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

interface GanttChartProps {
    tasks: GanttTask[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
    const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleTaskChange = (task: GanttTask) => {
      console.log("On date change Id:" + task.id);
      // Here you would handle updating the task dates if needed
      // For this example, we'll keep it read-only
    };

    const handleTaskDelete = (task: GanttTask) => {
        console.log("On delete " + task.id);
        // Here you would handle task deletion
    };

    const handleProgressChange = async (task: GanttTask) => {
        console.log("On progress change Id:" + task.id);
        // Handle progress change
    };

    const handleDblClick = (task: GanttTask) => {
        alert("On Double Click event Id:" + task.id);
    };

    const handleClick = (task: GanttTask) => {
        console.log("On Click event Id:" + task.id);
    };

    let columnWidth = 65;
    if (view === ViewMode.Year) {
        columnWidth = 350;
    } else if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-4">
                <button className="text-sm px-2 py-1 border rounded" onClick={() => setView(ViewMode.Day)}>Day</button>
                <button className="text-sm px-2 py-1 border rounded" onClick={() => setView(ViewMode.Week)}>Week</button>
                <button className="text-sm px-2 py-1 border rounded" onClick={() => setView(ViewMode.Month)}>Month</button>
            </div>
            {isClient && tasks.length > 0 ? (
                <Gantt
                    tasks={tasks}
                    viewMode={view}
                    onDateChange={handleTaskChange}
                    onDelete={handleTaskDelete}
                    onProgressChange={handleProgressChange}
                    onDoubleClick={handleDblClick}
                    onClick={handleClick}
                    ganttHeight={400}
                    columnWidth={columnWidth}
                    listCellWidth=""
                    barBackgroundColor="hsl(var(--primary))"
                    barProgressColor="hsl(var(--primary-foreground))"
                    barProgressSelectedColor="hsl(var(--primary-foreground))"
                    arrowColor="hsl(var(--foreground))"
                    todayColor="hsla(var(--primary), 0.2)"
                    barFill={60}
                />
            ) : (
                <p className="text-muted-foreground">No tasks with valid dates to display in the Gantt chart.</p>
            )}
        </div>
    );
}
