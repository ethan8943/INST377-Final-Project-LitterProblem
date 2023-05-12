

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 
  }
  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#watersheds_list");
    target.innerHTML = "";
    list.forEach((item) => {
      const str = `<li>${item.major_wshed}</li>`;
      target.innerHTML += str;
    });
  }
  
  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.major_wshed.toLowerCase();
      const lowerCaseQuery = query.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });

  }
  
  function cutWatershedsList(list) {
    console.log("fired cut List");
    const range = [...Array(10).keys()];
    return (newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length - 1);
      return list[index];
    }));
  }


  
  function initChart(targetElement, dataObject){
    const labels = Object.keys(dataObject);
    const info = Object.keys(dataObject).map((item) => dataObject[item].length);
    
      const data = {
        labels: labels,
        datasets: [{
          label: 'Watersheds by types of litter',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: info
        }]
      };
    
        const config = {
        type: 'bar',
        data: data,
        options: {}
      };

    return new Chart(
        targetElement,
        config
      );
  }


  function changeChart(chart, dataObject){
    const labels = Object.keys(dataObject);
    const info = Object.keys(dataObject).map((item) => dataObject[item].length);

    chart.data.labels = labels;
    chart.data.datasets.forEach((set) => { 
        set.data = info; 
        return set;
    })
    chart.update();
  }

  function shapeDataForLineChart(array){
    return array.reduce((collection, item) => {
        if(!collection[item.type_litter]){
            collection[item.type_litter] = [item]
        }else{
            collection[item.type_litter].push(item);
        }
        return collection;
    }, {});
  }

  async function getData() {
    const url = 'https://data.princegeorgescountymd.gov/resource/9tsa-iner.json';
    const data = await fetch(url);
    const json = await data.json();
    const reply = json.filter((item) => Boolean(item.permit_num)).filter((item) => Boolean(item.major_wshed));
    return reply;
  }

  async function mainEvent() {
    const mainForm = document.querySelector(".main_form"); 
    const loadDataButton = document.querySelector("#data_load");
    const clearDataButton = document.querySelector("#data_clear");
    const generateListButton = document.querySelector("#generate");

    const chartTarget = document.querySelector('#myChart');

    const textField = document.querySelector("#resto");
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    generateListButton.classList.add("hidden");

    const chartData = await getData();
    const shapeData = shapeDataForLineChart(chartData);
    const myChart = initChart(chartTarget, shapeData);
  
    const storedData = localStorage.getItem('storedData');
    let parsedData = JSON.parse(storedData);
    if (chartData?.length > 0) {
      generateListButton.classList.remove("hidden");
    }
  
    let currentList = []; 
    loadDataButton.addEventListener("click", async (submitEvent) => {
  
      console.log("Loading data");
      loadAnimation.style.display = "inline-block";
  
    
      const results = await fetch(
        "https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json"
      );
  
      const storedList = await results.json();


      localStorage.setItem('storedData', JSON.stringify(storedList));
      parsedData = storedList;

      if (chartData?.length > 0) {
        generateListButton.classList.remove("hidden");
      }

      loadAnimation.style.display = "none";
  

    });
  

  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      currentList = cutWatershedsList(chartData);
      console.log(currentList);
      injectHTML(currentList);
      const localData = shapeDataForLineChart(currentList);
      changeChart(myChart, localData);
    });
  
    textField.addEventListener("input", (event) => {
      console.log("input", event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      const localData = shapeDataForLineChart(newList);
      changeChart(myChart, localData);

    
    });

    clearDataButton.addEventListener("click", (event) => {
        console.log('clear browser data');
        localStorage.clear();
        console.log('localStorage Check', localStorage.getItem("storedData"))
    })

  }
  

  document.addEventListener("DOMContentLoaded", async () => mainEvent()); 
  