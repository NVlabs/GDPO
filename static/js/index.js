window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function() {
    // Check for click events on the navbar burger icon
    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    }

    // Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    
    bulmaSlider.attach();
})

// Add this to your JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the visualization
  initVisualization();
});

// Global variables
let data = [];
let categories = [];
let simulation;
let scatterWidth = 500;
let scatterHeight = 500;
let treemapWidth = 500;
let treemapHeight = 500;
let scatterSvg, treemapSvg;
let nodes = [];
let selectedCategory = null;

function initVisualization() {
  // Get container dimensions to make visualizations responsive
  const scatterContainer = document.getElementById('scatter-plot');
  const treemapContainer = document.getElementById('treemap');
  
  scatterWidth = scatterContainer.clientWidth;
  scatterHeight = 500;
  treemapWidth = treemapContainer.clientWidth;
  treemapHeight = 500;
  
  // Create SVG containers
  scatterSvg = d3.select('#scatter-plot')
    .append('svg')
    .attr('width', scatterWidth)
    .attr('height', scatterHeight);
  
  treemapSvg = d3.select('#treemap')
    .append('svg')
    .attr('width', treemapWidth)
    .attr('height', treemapHeight);
  
  // Generate sample data
  generateData();
  
  // Create scatter plot
  createScatterPlot();
  
  // Create treemap
  createTreemap();
}

function generateData() {
  // Clear existing data
  data = [];
  
  // Define categories (domains) with names and colors
  categories = [
    { name: "1", color: "#4e79a7", percentage: 1.52, topics: ["Mathematics", "Algorithms", "Programming", "Software Development", "Data Analysis"] },
    { name: "2", color: "#f28e2c", percentage: 9.37, topics: ["Books", "Education", "Writing", "Literature", "AI Ethics", "History", "Philosophy"] },
    { name: "3", color: "#59a14f", percentage: 6.88, topics: ["Environmental Education", "History", "Architecture", "Engineering", "Classical Music"] },
    { name: "4", color: "#e15759", percentage: 5.52, topics: ["Education", "Teaching", "Science", "Engineering", "Psychology", "Special Education"] },
    { name: "5", color: "#76b7b2", percentage: 7.94, topics: ["International Trade", "Business", "Economics", "AI Consulting", "Ethical Decision Making"] },
    { name: "6", color: "#b07aa1", percentage: 6.06, topics: ["Genetics", "Biotechnology", "AI", "Robotics", "Aging", "Healthcare", "Industrial Automation"] },
    { name: "7", color: "#ff9da7", percentage: 5.47, topics: ["Chemistry", "Insects", "Taxonomy", "Agriculture", "Gardening", "Veterinary Science"] },
    { name: "8", color: "#9c755f", percentage: 2.10, topics: ["Gaming", "Role-Playing", "Board Games", "Video Games", "Strategy", "Fantasy", "Virtual Reality"] },
    { name: "9", color: "#bab0ac", percentage: 1.09, topics: ["Astronomy", "Cosmology", "Astrophysics", "Space Exploration", "Urban Planning"] },
    { name: "10", color: "#d37295", percentage: 11.57, topics: ["Health", "Sleep", "Clinical Technology", "Healthcare", "Fitness", "Addiction", "Early Childhood Education"] },
    { name: "11", color: "#a0cbe8", percentage: 3.17, topics: ["Software Development", "Programming", "Web Development", "JavaScript", "Databases"] },
    { name: "12", color: "#ffbe7d", percentage: 6.69, topics: ["Legal Assistance", "Consumer Rights", "Energy Efficiency", "Industrial Equipment", "Technology"] },
    { name: "13", color: "#8cd17d", percentage: 0.93, topics: ["Sports", "Cricket", "Soccer", "Tennis", "Basketball", "Cultural Heritage", "Competition"] },
    { name: "14", color: "#f1ce63", percentage: 1.33, topics: ["Music", "Instrumental Practice", "Guitar", "Jazz", "Singing", "Composition", "Music Theory"] },
    { name: "15", color: "#b3b3b3", percentage: 3.01, topics: ["Film", "Cinema", "Horror", "Sci-Fi", "Comics", "Literature", "Criticism", "Philosophy"] },
    { name: "16", color: "#86bcb6", percentage: 4.46, topics: ["Sustainability", "Climate Change", "Renewable Energy", "Environmental Conservation"] },
    { name: "17", color: "#e6a0c4", percentage: 7.11, topics: ["Cardiovascular Health", "Medical Research", "Immunology", "Cancer Prevention", "Drug Therapy"] },
    { name: "18", color: "#7eb0d5", percentage: 4.61, topics: ["Technology", "Cybersecurity", "Social Media", "Privacy", "Artificial Intelligence", "Cloud Computing"] },
    { name: "19", color: "#d8b5a5", percentage: 4.30, topics: ["Social Media", "Digital Communication", "Internet Culture", "Misinformation", "Psychology"] },
    { name: "20", color: "#79c0c0", percentage: 6.79, topics: ["Public Safety", "Law Enforcement", "Political History", "Social Justice", "Government"] }
  ];
  
  // Check if documentSamples is already defined from document_samples.js
  if (typeof documentSamples === 'undefined') {
    console.warn("document_samples.js not loaded properly, creating empty object");
    documentSamples = {};
  }

  // Ensure all categories have samples
  categories.forEach(category => {
    // Check if samples exist for this category
    if (!documentSamples[category.name]) {
      console.warn(`No samples found for category ${category.name}, creating placeholder`);
      documentSamples[category.name] = [];
      
      // Add a few placeholders if no samples exist
      for (let i = 0; i < 5; i++) {
        documentSamples[category.name].push({
          title: `Sample ${i+1} for ${category.name}`,
          snippet: `Placeholder for ${category.name} content`
        });
      }
    }
    
    // Ensure all samples have a title field (if it's missing in your data)
    documentSamples[category.name].forEach((doc, index) => {
      if (!doc.title) {
        doc.title = `Document ${index+1} from Category ${category.name}`;
      }
    });
  });

  console.log("Using document samples:", documentSamples);
  
  // Generate random points for each category with better distribution
  let id = 0;
  categories.forEach((category, i) => {
    // Random center for this cluster - ensure better distribution
    const centerX = 100 + (scatterWidth - 200) * (i % 5) / 5;
    const centerY = 100 + (scatterHeight - 200) * Math.floor(i / 5) / 4;
    
    // Generate exactly 20 points per category
    const numPoints = 20;
    
    // Generate points around the center
    for (let j = 0; j < numPoints; j++) {
      // Generate random semantic metrics
      const relevance = Math.round((0.5 + Math.random() * 0.5) * 100) / 100; // 0.5 to 1.0
      const confidence = Math.round((0.6 + Math.random() * 0.4) * 100) / 100; // 0.6 to 1.0
      const sentiment = Math.round((Math.random() * 2 - 1) * 100) / 100; // -1.0 to 1.0
      const wordCount = Math.floor(100 + Math.random() * 900); // 100 to 1000
      const uniqueTerms = Math.floor(wordCount * (0.3 + Math.random() * 0.2)); // 30-50% of word count
      
      const document = documentSamples[category.name][j];
      
      const point = {
        id: id++,
        x: centerX + randomGaussian() * 30, // Reduced spread
        y: centerY + randomGaussian() * 30, // Reduced spread
        category: i,
        categoryName: category.name,
        color: category.color,
        radius: 4 + Math.random() * 3, // Slightly smaller points
        
        // Document details
        title: document.title,
        snippet: document.snippet,
        
        // Generate a random date within the last 2 years
        date: new Date(Date.now() - Math.random() * 63072000000).toISOString().split('T')[0] // Random date in last 2 years
      };
      data.push(point);
    }
  });
}

// Helper function for Gaussian distribution
function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function createScatterPlot() {
  // Create nodes for force simulation
  nodes = data.map(d => Object.assign({}, d));
  
  // Create force simulation with adjusted parameters
  simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-30))
    .force('center', d3.forceCenter(scatterWidth / 2, scatterHeight / 2))
    .force('x', d3.forceX(scatterWidth / 2).strength(0.1))
    .force('y', d3.forceY(scatterHeight / 2).strength(0.1))
    .force('collision', d3.forceCollide().radius(d => d.radius + 2))
    .on('tick', ticked);
  
  // Create circles for each data point
  scatterSvg.selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('opacity', 0.8)
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .on('mouseover', handlePointMouseOver)
    .on('mouseout', handleMouseOut)
    .on('click', handlePointClick);
  
  // Add category labels
  setTimeout(() => {
    addCategoryLabels();
  }, 1000); // Add labels after simulation has settled a bit
  
  // Function to update circle positions with boundary constraints
  function ticked() {
    scatterSvg.selectAll('circle')
      .attr('cx', d => {
        // Constrain to scatter plot boundaries with padding
        return Math.max(d.radius + 10, Math.min(scatterWidth - d.radius - 10, d.x));
      })
      .attr('cy', d => {
        // Constrain to scatter plot boundaries with padding
        return Math.max(d.radius + 10, Math.min(scatterHeight - d.radius - 10, d.y));
      });
  }
}

function addCategoryLabels() {
  // Calculate the center of each category cluster
  categories.forEach((category, i) => {
    const categoryPoints = nodes.filter(d => d.category === i);
    const avgX = d3.mean(categoryPoints, d => d.x);
    const avgY = d3.mean(categoryPoints, d => d.y);
    
    scatterSvg.append('text')
      .attr('x', avgX)
      .attr('y', avgY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', category.color)
      .style('stroke', 'white')
      .style('stroke-width', 3)
      .style('paint-order', 'stroke')
      .text(category.name)
      .on('mouseover', () => handleCategoryLabelMouseOver(i))
      .on('mouseout', handleMouseOut)
      .on('click', () => handleCategoryLabelClick(i));
  });
}

function createTreemap() {
  // Prepare data for treemap
  const treemapData = {
    name: "root",
    children: categories.map((category, i) => {
      return {
        name: category.name,
        category: i,
        color: category.color,
        value: category.percentage, // Use percentage directly as the value
        percentage: category.percentage
      };
    })
  };
  
  // Create treemap layout
  const treemap = d3.treemap()
    .size([treemapWidth, treemapHeight])
    .paddingOuter(4)
    .paddingTop(20)
    .paddingInner(1)
    .round(true);
  
  // Create hierarchy
  const root = d3.hierarchy(treemapData)
    .sum(d => d.value) // Sum by the percentage value
    .sort((a, b) => b.value - a.value);
  
  // Compute the treemap layout
  treemap(root);
  
  // Create a group for the treemap
  const treemapGroup = treemapSvg.append('g')
    .attr('transform', 'translate(0, 0)');
  
  // Create rectangles for each leaf node
  const cells = treemapGroup.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`)
    .on('mouseover', handleTreemapMouseOver)
    .on('mouseout', handleMouseOut)
    .on('click', handleTreemapClick);
  
  cells.append('rect')
    .attr('width', d => Math.max(0, d.x1 - d.x0))
    .attr('height', d => Math.max(0, d.y1 - d.y0))
    .attr('fill', d => d.data.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);
  
  // Add category name labels
  cells.append('text')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', d => (d.y1 - d.y0) / 2 - 10)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', 'white')
    .style('text-shadow', '1px 1px 2px black')
    .text(d => d.data.name);
  
  // Add percentage labels
  cells.append('text')
    .attr('x', d => (d.x1 - d.x0) / 2)
    .attr('y', d => (d.y1 - d.y0) / 2 + 10)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '10px')
    .style('fill', 'white')
    .style('text-shadow', '1px 1px 2px black')
    .text(d => `${d.data.percentage}%`);
}

function handlePointMouseOver(event, d) {
  // Show details panel
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.classList.remove('is-hidden');
  
  // Update details content
  const detailsTitle = document.getElementById('details-title');
  const detailsContent = document.getElementById('details-content');
  
  detailsTitle.textContent = d.categoryName;
  detailsContent.innerHTML = `
    <p>${d.snippet}</p>
  `;
  
  // Highlight this point
  d3.select(this)
    .attr('stroke', '#000')
    .attr('stroke-width', 2)
    .attr('r', d => d.radius * 1.5);
  
  // Highlight corresponding category in treemap
  highlightTreemapCategory(d.category);
}

function handleCategoryLabelMouseOver(category) {
  // Show details panel
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.classList.remove('is-hidden');
  
  // Update details content
  const detailsTitle = document.getElementById('details-title');
  const detailsContent = document.getElementById('details-content');
  
  // Get category info
  const categoryInfo = categories[category];
  
  detailsTitle.textContent = "Cluster " + categoryInfo.name;
  detailsContent.innerHTML = `
    <p><strong>Percentage:</strong> ${categoryInfo.percentage}%</p>
    <p><strong>Topics:</strong> ${categoryInfo.topics.join(", ")}</p>
  `;
  
  // Highlight all points in this category
  highlightScatterCategory(category);
  
  // Highlight corresponding category in treemap
  highlightTreemapCategory(category);
}

function handleTreemapMouseOver(event, d) {
  // Show details panel
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.classList.remove('is-hidden');
  
  // Update details content
  const detailsTitle = document.getElementById('details-title');
  const detailsContent = document.getElementById('details-content');
  
  // Get category info
  const category = d.data.category;
  const categoryInfo = categories[category];
  
  detailsTitle.textContent = "Cluster " + d.data.name;
  detailsContent.innerHTML = `
    <p><strong>Percentage:</strong> ${categoryInfo.percentage}%</p>
    <p><strong>Topics:</strong> ${categoryInfo.topics.join(", ")}</p>
  `;
  
  // Highlight this treemap cell
  d3.select(this)
    .select('rect')
    .attr('stroke', '#000')
    .attr('stroke-width', 3);
  
  // Highlight corresponding points in scatter plot
  highlightScatterCategory(d.data.category);
}

function handleMouseOut() {
  // Hide details panel
  document.getElementById('details-panel').classList.add('is-hidden');
  
  // Reset scatter plot highlights if no category is selected
  if (selectedCategory === null) {
    scatterSvg.selectAll('circle')
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('r', d => d.radius);
  }
  
  // Reset treemap highlights if no category is selected
  if (selectedCategory === null) {
    treemapSvg.selectAll('rect')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  }
}

function handlePointClick(event, d) {
  toggleCategorySelection(d.category);
}

function handleCategoryLabelClick(category) {
  toggleCategorySelection(category);
}

function handleTreemapClick(event, d) {
  toggleCategorySelection(d.data.category);
}

function toggleCategorySelection(category) {
  if (selectedCategory === category) {
    // Deselect if already selected
    selectedCategory = null;
    
    // Reset all highlights
    scatterSvg.selectAll('circle')
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('r', d => d.radius);
    
    treemapSvg.selectAll('rect')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  } else {
    // Select new category
    selectedCategory = category;
    
    // Highlight selected category in both visualizations
    highlightScatterCategory(category);
    highlightTreemapCategory(category);
  }
}

function highlightScatterCategory(category) {
  // Highlight points in the selected category
  scatterSvg.selectAll('circle')
    .attr('opacity', d => d.category === category ? 1 : 0.3)
    .attr('stroke', d => d.category === category ? '#000' : '#fff')
    .attr('stroke-width', d => d.category === category ? 2 : 0.5)
    .attr('r', d => d.category === category ? d.radius * 1.2 : d.radius);
}

function highlightTreemapCategory(category) {
  // Highlight the selected category in the treemap
  treemapSvg.selectAll('rect')
    .attr('stroke', d => d.data.category === category ? '#000' : '#fff')
    .attr('stroke-width', d => d.data.category === category ? 4 : 2);
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Clear existing visualizations
    d3.select('#scatter-plot').select('svg').remove();
    d3.select('#treemap').select('svg').remove();
    
    // Reinitialize with new dimensions
    initVisualization();
  }, 250);
});