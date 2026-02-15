const API = "https://poll-backend-bxqr.onrender.com/api";

export const createPoll = async (data) => {
  const res = await fetch(`${API}/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getPoll = async (id) => {
  const res = await fetch(`${API}/polls/${id}`);
  return res.json();
};

export const closePoll = async (id) => {
  await fetch(`${API}/polls/${id}/close`, { method: "POST" });
};