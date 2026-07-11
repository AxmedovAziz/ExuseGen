fetch("http://127.0.0.1:8000/api/excuses/generate/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    reason: "doctor appointment",
    category: "late",
    target: "school",
    author_role: "parent",
    student_name: "Michael Johnson",
    date: "March 8",
    tone: "formal",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
