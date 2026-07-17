```{=html}
<div class="mn-topic-article-list">
<%
  const topic = templateParams.topic;
  const matches = items.filter((item) =>
    Array.isArray(item.categories) && item.categories.includes(topic)
  );
%>
<% if (matches.length === 0) { %>
  <p class="mn-topic-empty">No published articles use this topic yet.</p>
<% } %>
<% for (const item of matches) { %>
  <article class="mn-topic-article-card">
    <p class="mn-kicker">RELATED WRITING</p>
    <h3><a href="<%- item.path %>"><%- item.title %></a></h3>
    <% if (item.description) { %><p><%- item.description %></p><% } %>
    <% if (item.date) { %><small><%- item.date %></small><% } %>
  </article>
<% } %>
</div>
```
