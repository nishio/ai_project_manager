'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Task } from '../../utils/backlogLoader';
import TaskSidebar from '../sidebar/TaskSidebar';

// タスクIDの正規表現パターン
const TASK_ID_PATTERN = /T\d{4}/g;

/**
 * テキスト内のタスクIDを検出する
 * @param text 検索対象のテキスト
 * @returns 検出されたタスクIDの配列
 */
function detectTaskIds(text: string): string[] {
  const matches = text.match(TASK_ID_PATTERN);
  return matches ? [...new Set(matches)] : [];
}

/**
 * タスクIDからタスクを検索する
 * @param taskId 検索対象のタスクID
 * @param tasks タスクの配列
 * @returns 見つかったタスク、または undefined
 */
function findTaskById(taskId: string, tasks: Task[]): Task | undefined {
  return tasks.find(task => task.id === taskId);
}

interface TaskMarkdownProps {
  markdown: string;
  tasks: Task[];
}

export default function TaskMarkdown({ markdown, tasks }: TaskMarkdownProps) {
  const [sidebarTasks, setSidebarTasks] = useState<Task[]>([]);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [hoveredTaskInfo, setHoveredTaskInfo] = useState<Task | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    // クリックイベントの伝播を停止
    e.stopPropagation();
    
    console.log(`Clicked on task ID: ${taskId}`);
    const task = findTaskById(taskId, tasks);
    
    if (task) {
      console.log(`Found task: ${task.title}`);
      
      // すでに表示されているタスクは追加しない
      if (!sidebarTasks.some((t: Task) => t.id === task.id)) {
        console.log(`Adding task to sidebar: ${task.title}`);
        
        // 関数形式のsetStateを使用して確実に最新の状態を更新
        setSidebarTasks(prevTasks => {
          console.log('Previous sidebar tasks:', prevTasks);
          const newTasks = [...prevTasks, task];
          console.log('New sidebar tasks:', newTasks);
          
          // 開発者ツールでデバッグ用に出力
          setTimeout(() => {
            console.log('Sidebar tasks after update:', sidebarTasks);
          }, 0);
          
          return newTasks;
        });
      } else {
        console.log(`Task already in sidebar: ${task.title}`);
      }
    } else {
      console.log(`Task not found for ID: ${taskId}`);
    }
  };

  const handleTaskHover = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    // e.preventDefault()は削除して、ホバーイベントが正常に処理されるようにする
    console.log(`Hovering over task ID: ${taskId}`);
    const task = findTaskById(taskId, tasks);
    if (task) {
      console.log(`Found task for hover: ${task.title}`);
      setHoveredTaskId(taskId);
      setHoveredTaskInfo(task);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTaskLeave = () => {
    setHoveredTaskId(null);
    setHoveredTaskInfo(null);
  };

  const handleCloseSidebar = () => {
    console.log('Closing all tasks in sidebar');
    setSidebarTasks(prevTasks => {
      console.log('Previous sidebar tasks before closing all:', prevTasks);
      return [];
    });
  };

  const handleCloseTask = (taskId: string) => {
    console.log(`Closing task: ${taskId}`);
    setSidebarTasks(prevTasks => {
      console.log('Previous sidebar tasks before closing:', prevTasks);
      const newTasks = prevTasks.filter(task => task.id !== taskId);
      console.log('New sidebar tasks after closing:', newTasks);
      return newTasks;
    });
  };

  // タスクIDを処理して強調表示する
  const processTaskIds = (content: React.ReactNode): React.ReactNode => {
    // 文字列の場合は現在の処理を適用
    if (typeof content === 'string') {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      // 正規表現で一致するすべてのタスクIDを検索
      const regex = new RegExp(TASK_ID_PATTERN, 'g');
      while ((match = regex.exec(content)) !== null) {
        const taskId = match[0];
        const task = findTaskById(taskId, tasks);
        
        // タスクIDの前のテキストを追加
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        
        // タスクが見つかるかどうかに関わらず、すべてのタスクIDをハイライト表示
        // タスクが見つからない場合は、クリック時の動作を無効にする
        parts.push(
          <span
            key={`${taskId}-${match.index}`}
            className={`inline-block px-1 rounded cursor-pointer ${
              task ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={(e) => task && handleTaskClick(e, taskId)}
            onMouseEnter={(e) => task && handleTaskHover(e, taskId)}
            onMouseLeave={handleTaskLeave}
            data-task-id={taskId}
            title={task ? `${task.title} - クリックでサイドバーに追加` : 'タスクが見つかりません'}
          >
            {taskId}
          </span>
        );
        
        lastIndex = match.index + taskId.length;
      }
      
      // 残りのテキストを追加
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : content;
    }
    
    // 配列の場合は各要素を再帰的に処理
    if (Array.isArray(content)) {
      return content.map((child, index) => (
        <React.Fragment key={index}>{processTaskIds(child)}</React.Fragment>
      ));
    }
    
    // Reactエレメントの場合はchildrenを再帰的に処理
    if (React.isValidElement(content)) {
      // TypeScriptの型アサーションを追加して、content.propsがオブジェクト型であることを明示
      const props = content.props as Record<string, unknown>;
      const children = React.Children.toArray(props.children as React.ReactNode);
      if (children.length > 0) {
        return React.cloneElement(
          content,
          { ...props },
          ...React.Children.map(children, child => processTaskIds(child))
        );
      }
    }
    
    // その他の場合はそのまま返す
    return content;
  };

  // タスクIDをハイライトするためのカスタムレンダラー
  const customRenderers = {
    p: ({ children }: { children: React.ReactNode }) => {
      return <p>{processTaskIds(children)}</p>;
    },
    li: ({ children }: { children: React.ReactNode }) => {
      return <li>{processTaskIds(children)}</li>;
    },
    h1: ({ children }: { children: React.ReactNode }) => {
      return <h1>{processTaskIds(children)}</h1>;
    },
    h2: ({ children }: { children: React.ReactNode }) => {
      return <h2>{processTaskIds(children)}</h2>;
    },
    h3: ({ children }: { children: React.ReactNode }) => {
      return <h3>{processTaskIds(children)}</h3>;
    },
    h4: ({ children }: { children: React.ReactNode }) => {
      return <h4>{processTaskIds(children)}</h4>;
    },
    h5: ({ children }: { children: React.ReactNode }) => {
      return <h5>{processTaskIds(children)}</h5>;
    },
    h6: ({ children }: { children: React.ReactNode }) => {
      return <h6>{processTaskIds(children)}</h6>;
    },
    strong: ({ children }: { children: React.ReactNode }) => {
      return <strong>{processTaskIds(children)}</strong>;
    },
    em: ({ children }: { children: React.ReactNode }) => {
      return <em>{processTaskIds(children)}</em>;
    },
    code: ({ children }: { children: React.ReactNode }) => {
      return <code>{children}</code>;
    }
  };

  // Debug: Log sidebar tasks whenever they change
  React.useEffect(() => {
    if (sidebarTasks.length > 0) {
      console.log('Sidebar tasks updated:', sidebarTasks);
    }
  }, [sidebarTasks]);
  
  // Debug: Log when component renders
  React.useEffect(() => {
    console.log('TaskMarkdown component rendered');
  }, []);
  
  // Ensure the component re-renders when tasks change
  React.useEffect(() => {
    console.log('Tasks updated:', tasks);
  }, [tasks]);

  // Debug: Log when rendering with sidebar tasks
  React.useEffect(() => {
    console.log('Rendering with sidebar tasks:', sidebarTasks);
  }, [sidebarTasks]);
  
  // Debug: Log when task IDs are detected in nested elements
  React.useEffect(() => {
    console.log('TaskMarkdown component rendered with markdown:', markdown);
    console.log('Detected task IDs:', detectTaskIds(markdown));
  }, [markdown]);

  return (
    <div className="relative">
      <div className="markdown-content">
        <ReactMarkdown components={customRenderers as any}>{markdown}</ReactMarkdown>
      </div>

      {/* ホバー時のツールチップ */}
      {hoveredTaskInfo && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded p-3 max-w-xs border border-gray-200 dark:border-gray-700"
          style={{
            top: mousePosition.y + 20,
            left: mousePosition.x,
            pointerEvents: 'none', // ツールチップがマウスイベントを妨げないようにする
          }}
        >
          <h3 className="font-bold text-blue-800 dark:text-blue-300">{hoveredTaskInfo.title}</h3>
          <p className="text-sm mt-1 dark:text-gray-300">{hoveredTaskInfo.description?.substring(0, 100) || '説明なし'}...</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">クリックでサイドバーに追加</p>
        </div>
      )}

      {/* サイドバー */}
      <TaskSidebar
        tasks={sidebarTasks}
        onClose={handleCloseSidebar}
        onCloseAll={handleCloseSidebar}
        onCloseTask={handleCloseTask}
      />
    </div>
  );
}
