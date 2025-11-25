// Fetch DB messages
fetch('/api/messages')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('db-items');
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.text;
      list.appendChild(li);
    });
  });

// Fetch random words
fetch('/words')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('words');
    data.forEach(word => {
      const li = document.createElement('li');
      li.textContent = word;
      list.appendChild(li);
    });
  });
