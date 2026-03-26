import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export const getCurrentRound = () => api.get('/round/current?lang=en').then(res => res.data);
export const joinGame = (name) => api.post('/player/join', { name }).then(res => res.data);
export const updateProgress = (data) => api.post('/progress/update', data).then(res => res.data);
export const getLeaderboard = () => api.get('/leaderboard/current?lang=en').then(res => res.data);
