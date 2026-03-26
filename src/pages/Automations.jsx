import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Automations.css';

const ModernNode = ({ data, isConnectable }) => {
  return (
    <div className={`modern-node ${data.customClass} active`} style={{ width: '300px' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="custom-handle top-handle" />
      <div className="node-icon" style={{backgroundColor: data.iconBg, color: data.iconColor}}>{data.icon}</div>
      <div className="node-content">
        <strong>{data.label}</strong>
        <span>{data.sublabel}</span>
      </div>
      <div className="node-menu">⋮</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="custom-handle bottom-handle" />
    </div>
  );
};

const nodeTypes = { modernNode: ModernNode };

const initialNodes = [
  { id: '1', type: 'modernNode', position: { x: 50, y: 50 }, data: { label: 'Trigger Event', sublabel: 'Keyword: "Hi"', icon: '⚡', iconBg: '#fef3c7', iconColor: '#d97706', customClass: 'trigger-node' } },
  { id: '2', type: 'modernNode', position: { x: 50, y: 200 }, data: { label: 'Condition', sublabel: 'If business hours', icon: '🔀', iconBg: '#e0e7ff', iconColor: '#4338ca', customClass: 'condition-node' } },
  { id: '3', type: 'modernNode', position: { x: 50, y: 350 }, data: { label: 'Send Message', sublabel: 'Template: Welcome_01', icon: '💬', iconBg: '#dcf8c6', iconColor: 'var(--primary-dark)', customClass: 'action-node' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
];

const initialFlows = [];

export default function Automations({ showToast }) {
  const [flows, setFlows] = useState(initialFlows);
  const [activeView, setActiveView] = useState('list');
  const [selectedFlow, setSelectedFlow] = useState(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds)), [setEdges]);

  const handleCreateNew = () => {
    const newFlow = {
      id: Date.now(),
      name: `New Flow ${flows.length + 1}`,
      status: 'Draft',
      trigger: 'Not configured',
      usage: '0'
    };
    setFlows([...flows, newFlow]);
    setSelectedFlow(newFlow);
    setActiveView('editor');
    if(showToast) showToast('New Interactive Workspace Created!');
  };

  const handleSelectFlow = (flow) => {
    setSelectedFlow(flow);
    setActiveView('editor');
  };

  const handleBack = () => {
    setActiveView('list');
    setSelectedFlow(null);
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleAddNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: 'modernNode',
      position: { x: 50, y: Math.max(...nodes.map(n => n.position.y)) + 150 },
      data: { label: 'New Step', sublabel: 'Configure node...', icon: '⚙️', iconBg: '#e9edef', iconColor: '#667781', customClass: 'action-node' }
    };
    
    // Automatically link from the previously latest node
    const lastNode = nodes[nodes.length - 1];
    setNodes([...nodes, newNode]);
    if (lastNode) {
       setEdges(eds => addEdge({ source: lastNode.id, target: newNode.id, animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds));
    }
    if(showToast) showToast('Node Added visually!', 'success');
  };

  const handleDeleteNode = () => {
    if(!selectedNode) return;
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    if(showToast) showToast('Node deleted', 'warning');
  };

  return (
    <div className="automations-page">
      {activeView === 'list' ? (
        <div className="list-view-container">
          <div className="page-header">
            <div>
              <h1>Automations</h1>
              <p>Create visual bot flows and rule-based triggers.</p>
            </div>
            <button className="primary-btn" onClick={handleCreateNew}>+ Create Flow</button>
          </div>
          
          <div className="flow-grid">
            {flows.map(flow => (
              <div key={flow.id} className="flow-card" onClick={() => handleSelectFlow(flow)} style={{ cursor: 'pointer' }}>
                <div className="flow-header">
                  <h3>{flow.name}</h3>
                  <span className={`badge ${flow.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {flow.status}
                  </span>
                </div>
                <p><strong>Trigger:</strong> {flow.trigger}</p>
                <div className="flow-footer">
                  <span>Started {flow.usage} times</span>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleSelectFlow(flow);}}>✏️</button>
                </div>
              </div>
            ))}
            
            <div className="flow-card create-new" onClick={handleCreateNew}>
              <div className="create-icon">+</div>
              <h3>Build from Scratch</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="flow-editor-view">
          <div className="page-header editor-header">
            <div className="header-breadcrumbs">
              <button className="icon-btn" onClick={handleBack} style={{marginRight: '8px'}}>← Back</button>
              <div>
                <h1>{selectedFlow?.name}</h1>
                <span className="editor-subtitle">Last edited just now</span>
              </div>
            </div>
            <div className="header-actions">
              <span className={`badge ${selectedFlow?.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{marginRight: '16px'}}>
                {selectedFlow?.status}
              </span>
              <button className="secondary-btn" onClick={() => { if(showToast) showToast('Draft saved successfully'); handleBack(); }} style={{marginRight: '8px'}}>Save Draft</button>
              <button className="primary-btn" onClick={() => { if(showToast) showToast('Flow published!'); handleBack(); }}>Publish</button>
            </div>
          </div>
          
          <div className="editor-workspace">
            <div className="flow-canvas" style={{ width: '100%', height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelectedNode(null)}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.5}
                maxZoom={1.5}
              >
                <Background color="#cbd5e1" gap={20} size={1} />
                <Controls />
                <MiniMap nodeStrokeWidth={3} nodeColor="#cbd5e1" maskColor="rgba(240, 242, 245, 0.7)" />
              </ReactFlow>
            </div>
            
            <div className="editor-sidebar">
              <div className="sidebar-header">
                <h3>{selectedNode ? `Configure Node` : 'Properties'}</h3>
              </div>
              <div className="sidebar-content">
                {selectedNode ? (
                  <>
                    <div className="form-group">
                      <label>Node Name</label>
                      <input 
                         type="text" 
                         value={selectedNode.data.label} 
                         onChange={(e) => {
                            setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n));
                         }} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Node Type</label>
                      <select className="modern-select">
                        <option>Keyword Trigger</option>
                        <option>Inbound Message</option>
                        <option>Send Message</option>
                        <option>Condition</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Details</label>
                      <input 
                         type="text" 
                         value={selectedNode.data.sublabel} 
                         onChange={(e) => {
                            setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, sublabel: e.target.value } } : n));
                         }} 
                      />
                    </div>
                    <button className="danger-btn full-width mt-4" onClick={handleDeleteNode}>Delete Node</button>
                  </>
                ) : (
                  <>
                    <p style={{color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px'}}>Select a node on the canvas to configure it, or drag and add entirely new steps to your flow.</p>
                    <button className="primary-btn full-width" onClick={handleAddNode}>+ Add Step</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
