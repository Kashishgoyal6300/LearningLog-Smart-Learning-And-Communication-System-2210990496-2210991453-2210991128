import axios from 'axios';

async function testChatFull() {
  console.log("Step 1: Logging in...");
  let token = "";
  
  try {
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "kashishgoyal0003@gmail.com",
      password: "your_actual_password"
    });
    token = loginRes.data.token;
    console.log("Login successful, token acquired.");
  } catch (err) {
    // Try the test user we created
    try {
      const loginRes2 = await axios.post("http://localhost:8080/api/auth/login", {
        email: "test_chat_debug_123@gmail.com",
        password: "password123"
      });
      token = loginRes2.data.token;
      console.log("Test user login successful.");
    } catch (err2) {
      console.error("Login failed:", err2.response?.data || err2.message);
      return;
    }
  }

  console.log("Step 2: Fetching chat history...");
  try {
    const email = "kashishgoyal0003@gmail.com";
    const res = await axios.get(`http://localhost:8080/api/chat/history?room=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS! Chat history working. Messages:", res.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Error body:", err.response?.data);
  }
}

testChatFull();
