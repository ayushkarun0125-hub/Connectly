export const mockUsers = [
  { id: 'u1', name: 'Aaryan', email: 'aaryan@connectly.app', role: 'admin' },
  { id: 'u2', name: 'Ayush', email: 'ayush@connectly.app', role: 'moderator' },
  { id: 'u3', name: 'Dhruv', email: 'dhruv@connectly.app', role: 'user' },
]

export const mockRooms = [
  { id: 'room_design', name: 'Design', lastMessage: 'Sprint planning at 4 PM', members: 9 },
  { id: 'room_backend', name: 'Backend', lastMessage: 'Socket handlers refactor done', members: 6 },
]

export const mockMessages = {
  room_design: [
    { id: 'm1', userId: 'u2', username: 'Ayush', content: 'Welcome to Connectly', timestamp: new Date().toISOString(), status: 'sent' },
    { id: 'm2', userId: 'u1', username: 'Aaryan', content: 'Whiteboard feels smooth now', timestamp: new Date().toISOString(), status: 'sent' },
  ],
  room_backend: [],
}

export const mockFiles = [
  { id: 'f1', name: 'wireframe.png', roomId: 'room_design', sender: 'Aaryan', size: '1.4 MB', type: 'image/png', uploadedAt: '2 min ago', preview: 'https://picsum.photos/200/120' },
  { id: 'f2', name: 'sprint-notes.pdf', roomId: 'room_design', sender: 'Dhruv', size: '420 KB', type: 'application/pdf', uploadedAt: '10 min ago' },
]
