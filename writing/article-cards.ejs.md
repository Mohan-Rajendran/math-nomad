```{=html}
<div class="mn-final-article-list">
<% for (const item of items) { %>
  <% const audiences = Array.isArray(item.audience) ? item.audience : (item.audience ? [item.audience] : []); %>
  <% const articleType = item["article-type"] || item.kind || "Article"; %>
  <% const topics = Array.isArray(item.topics) ? item.topics : (item.topics ? [item.topics] : []); %>
  <article class="mn-final-article-card" <%- metadataAttrs(item) %>>
    <div class="mn-final-article-topline">
      <div class="mn-final-article-meta">
        <% if (item.date) { %><span><%- item.date %></span><% } %>
        <% if (item["reading-time-label"] || item["reading-time"]) { %><span><%- item["reading-time-label"] || item["reading-time"] %></span><% } %>
      </div>
      <div class="mn-final-article-identity" aria-label="Audience and article type">
        <% for (const audience of audiences) { %><span><%- audience %></span><% } %>
        <span><%- articleType %></span>
      </div>
    </div>
    <% if (item.image) { %>
      <a class="mn-final-article-image" href="<%- item.href || item.path %>" tabindex="-1" aria-hidden="true">
        <img src="<%- item.image %>" alt="" loading="lazy">
      </a>
    <% } %>
    <h2><a href="<%- item.href || item.path %>"><%- item.title %></a></h2>
    <% if (item.description) { %><p><%- item.description %></p><% } %>
    <% if (topics.length) { %>
      <div class="mn-final-article-topics" aria-label="Article topics">
        <% for (const topic of topics) { %><span><%- topic %></span><% } %>
      </div>
    <% } %>
  </article>
<% } %>
</div>
```
