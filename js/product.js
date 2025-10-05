document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'catalog.html';
    return;
  }

  // Fetch product details
  try {
    const product = await fetch(`/api/products/${productId}`).then(res => res.json());
    renderProduct(product);
    document.getElementById('product-id').value = productId;
    loadReviews(productId);
  } catch (err) {
    console.error('Failed to load product:', err);
    document.getElementById('product-container').innerHTML = `
      <div class="alert alert-danger">Product not found. <a href="catalog.html">Back to catalog</a></div>
    `;
  }

  // Review form submission
  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('review-text').value.trim();
    
    if (!text) return;

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          text
        })
      });
      document.getElementById('review-text').value = '';
      loadReviews(productId);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    }
  });
});

function renderProduct(product) {
  document.getElementById('product-container').innerHTML = `
    <div class="col-md-6">
      <img src="${product.image}" class="img-fluid product-image rounded" alt="${product.name}">
    </div>
    <div class="col-md-6">
      <h1>${product.name}</h1>
      <p class="text-muted">${product.description}</p>
      <h4 class="my-3">$${product.price}</h4>
      <button class="btn btn-success add-to-cart" data-id="${product._id}">Add to Cart</button>
    </div>
  `;

  // Add to cart functionality
  document.querySelector('.add-to-cart').addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
  });
}

async function loadReviews(productId) {
  try {
    const reviews = await fetch(`/api/reviews?productId=${productId}`).then(res => res.json());
    const container = document.getElementById('reviews-container');
    
    if (reviews.length === 0) {
      container.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
      return;
    }

    container.innerHTML = reviews.map(review => `
      <div class="card mb-3 review-card">
        <div class="card-body">
          <p class="card-text">${review.text}</p>
          <small class="text-muted">Posted on ${new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load reviews:', err);
    container.innerHTML = '<p>Failed to load reviews. Please refresh the page.</p>';
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.getElementById('cart-count').textContent = cart.length;
}