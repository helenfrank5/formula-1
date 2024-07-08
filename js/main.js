//----- Helen Frank, IG2, für PE2 bei Prof. Hartmut Bohnacker

let stageHeight;
let stageWidth;
let toggleState = "map";
const renderer = $('#renderer');
const raceYears = {};
let resultsGroupedYearConstStatusId;
let countStatusResults;


let treemapGroups = [[3, 4, 20, 130, 138, 104], [
  5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36,
  37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49, 51, 56, 129, 59, 60, 61, 63,
  64, 65, 66, 67, 69, 70, 71, 72, 79, 80, 83, 84, 85, 86, 87, 91, 94, 95, 98,
  99, 101, 102, 103, 105, 106, 108, 109, 110, 121, 126, 131, 132, 135, 136, 137,
  140, 141], [68, 100, 107, 82, 73, 139], [78, 89, 93, 31, 54], [60, 95, 32, 48, 71, 69, 75], [76, 64, 90, 92]];

let treemapData = treemapGroups.map((arr) => {
  return arr.map((statusId) => {
    const status = gmynd.findFirstByValue(statusCases, "statusId", statusId).status;
    const count = gmynd.findAllByValue(results, "statusId", statusId).length;
    return { statusId: statusId, status: status, count: count };
  })
})
console.log(treemapData);

let colorsTree = ["#877FA8", "#BD86A6", "#D47E97", "#F59193", "#FFBC75", "#FFCC9F", "#FFBE4D"];

const data = [];
for (let i = 1; i <= 141; i++) {
  data.push(i);
}

$(function () {
  stageHeight = renderer.innerHeight();
  stageWidth = renderer.innerWidth();
  prepareData();
  drawConstructorMap();

  $(document).ready(function () {
    $('#toggleBtn1').click(function () {
      // Versteckt den Einleitungsscreen
      $('#intro-screen').fadeOut('slow', function () {
        // Zeigt den Hauptscreen
        $('#renderer').fadeIn('slow');
      });
    });
  });

  $('.toggleBtn').click(changeView);
});

function prepareData() {
  cumulatedResults = gmynd.cumulateData(results, 'statusId');
  cumulatedConstructor = gmynd.cumulateData(constructor, '');
  cumulatedRaces = gmynd.cumulateData(race, 'years');

  results.forEach(result => {
    const raceData = race.find(element => result.raceId === element.raceId);
    const constructorData = constructor.find(element => result.constructorId === element.constructorId);
    const statusData = statusCases.find(element => result.statusId === element.statusId);
    result.raceData = raceData;
    result.constructorData = constructorData;
    result.statusData = statusData;
    result.year = raceData.year;
    result.constructor = constructorData.name;
  });

  resultsGroupedYearConst = gmynd.groupData(results, ['year', 'constructor']);
  let countConstructorResults = gmynd.cumulateData(results, "constructor");
  gmynd.sortData(countConstructorResults, "-count");
  countConstructorResults = countConstructorResults.filter(el => el.count >= 55);
  constructorArray = countConstructorResults.map((el) => el.constructor);
  countStatusResults = gmynd.cumulateData(results, "statusId");
  countStatusResults = countStatusResults.filter(status => {
    return treemapGroups.flat().includes(status.statusId);
  });
  console.log(countStatusResults);
}

function drawConstructorMap() {
  toggleState = "map";
  let maxFailed = 0;

  // maximale Anzahl der "nicht beendeten" Rennen
  for (const resultsGroupedYearConstKey in resultsGroupedYearConst) {
    const yearConstructors = resultsGroupedYearConst[resultsGroupedYearConstKey];

    for (const yearConstrutorKey in yearConstructors) {
      const resultsConstructorYear = yearConstructors[yearConstrutorKey];
      const resultsFailed = resultsConstructorYear.filter(result => result.statusId !== 1).length;
      if (resultsFailed > maxFailed) maxFailed = resultsFailed;
    }
  }
  // Maximalen Konstrukteur-Array-Länge
  const constructorLengthMax = constructorArray.length;
  const barWidth = stageWidth / Object.keys(resultsGroupedYearConst).length;
  const gap = 1.5;
  const barHeight = (stageHeight - (constructorLengthMax - 1) * gap) / constructorLengthMax;

  let xPosIndex = 0;

  // Tooltip-Element
  const tooltip = $('<div></div>');
  tooltip.addClass('tooltip');
  $('body').append(tooltip);
  tooltip.hide();

  // Konstrukteur-Label-Element
  const constructorLabel = $('<div></div>');
  constructorLabel.addClass('constructorLabel');
  $('body').append(constructorLabel);
  constructorLabel.hide();

  const totalYears = Object.keys(resultsGroupedYearConst).length;

  // Schleife durch Jahre, X-Pos
  for (const resultsGroupedYearConstKey in resultsGroupedYearConst) {
    const yearConstructors = resultsGroupedYearConst[resultsGroupedYearConstKey];

    const xPos = xPosIndex * barWidth;

    // Schleife durch die Konstrukteure, Y-Pos
    constructorArray.forEach((constructor, yPosIndex) => {
      const yPos = yPosIndex * (barHeight + gap); // Anpassung der Y-Position

      const resultsConstructorYear = yearConstructors[constructor] || [];
      // Anzahl der Rennen, nicht finished / statusId != 1
      const resultsFailed = resultsConstructorYear.filter(result => result.statusId !== 1).length;
      // Prozentanzahl (nur wenn es Ergebnisse gibt)
      const percentageFailed = resultsFailed > 0 ? (resultsFailed / maxFailed * 100).toFixed(2) : 0;

      let color = '';
      let tooltipText = '';

      function calculateColor(percent) {
        let red = Math.round(255 * (1 - percent));
        return `rgb(${red}, 0, 0)`;
      }

      if (resultsFailed > 0.9 * maxFailed) {
        color = calculateColor(0.9); // >90%
        tooltipText = 'more than <b>90%</b>  incidents';
      } else if (resultsFailed > 0.8 * maxFailed) {
        color = calculateColor(0.8); // >80%
        tooltipText = 'more than <b>80%</b>  incidents';
      } else if (resultsFailed > 0.7 * maxFailed) {
        color = calculateColor(0.7); // >70%
        tooltipText = 'more than <b>70%</b>  incidents';
      } else if (resultsFailed > 0.6 * maxFailed) {
        color = calculateColor(0.6); // >60%
        tooltipText = 'more than <b>60%</b>  incidents';
      } else if (resultsFailed > 0.5 * maxFailed) {
        color = calculateColor(0.5); // >50%
        tooltipText = 'more than <b>50%</b>  incidents';
      } else if (resultsFailed > 0.4 * maxFailed) {
        color = calculateColor(0.4); // >40%
        tooltipText = 'more than <b>40%</b>  incidents';
      } else if (resultsFailed > 0.3 * maxFailed) {
        color = calculateColor(0.3); // >30%
        tooltipText = 'more than<b> 30%</b>  incidents';
      } else if (resultsFailed > 0.2 * maxFailed) {
        color = calculateColor(0.2); // >20%
        tooltipText = 'more than <b>20%</b> incidents';
      } else if (resultsFailed > 0.1 * maxFailed) {
        color = calculateColor(0.1); // >10%
        tooltipText = 'more than <b>10%</b>  incidents';
      } else if (resultsFailed > 0) {
        color = calculateColor(0.0000001); // >0% und <=10%, berechnen Sie die Farbe
        tooltipText = 'less than <b>10%</b>  incidents';
      } else {
        color = 'rgb(203, 203, 203)'; // 0%, dunkelgrau
        tooltipText = '<b>did not participate<b>';
      }

      const bar = $('<div></div>');
      bar.addClass('barConst');
      bar.css({
        'left': xPos,
        'top': yPos,
        'width': barWidth,
        'height': barHeight,
        'background-color': color,
        'position': 'absolute',
        'border-top-left-radius': xPosIndex === 0 ? '10px' : '0',
        'border-bottom-left-radius': xPosIndex === 0 ? '10px' : '0',
        'border-top-right-radius': xPosIndex === totalYears - 1 ? '10px' : '0',
        'border-bottom-right-radius': xPosIndex === totalYears - 1 ? '10px' : '0',
        'transform-origin': 'bottom center',
        'opacity': 1 // Setze die Opazität auf 1 für alle Balken
      });

      bar.attr('data-constructor', constructor);
      bar.attr('data-year', resultsGroupedYearConstKey);
      bar.attr('data-tooltip-text', tooltipText);
      bar.attr('data-yposindex', yPosIndex);

      // Hover Event für die Balken
      bar.hover(function (event) {
        const constructor = $(this).attr('data-constructor');
        const year = $(this).attr('data-year');
        const tooltipText = $(this).attr('data-tooltip-text');
        tooltip.html(`<b>${constructor} </b> <br> year: <b>${year}</b><br>${tooltipText}`);

        tooltip.show();

        const yposIndex = $(this).attr('data-yposindex');
        $('.barConst').each(function () {
          if ($(this).attr('data-yposindex') === yposIndex) {
            $(this).css({
              'transform': 'scale(1.01)', // Leichte Vergrößerung
              'border-top': '1px solid darkgray', // Border oben hinzufügen
              'border-bottom': '1px solid darkgray' // Border unten hinzufügen
            });
          }
        });

      }, function () {
        tooltip.hide();
        constructorLabel.hide(); // Konstrukteur-Label verstecken

        // Y-Achsenlinie und Border zurücksetzen
        const yposIndex = $(this).attr('data-yposindex');
        $('.barConst').each(function () {
          if ($(this).attr('data-yposindex') === yposIndex) {
            $(this).css({
              'transform': 'scale(1)', // Vergrößerung zurücksetzen
              'border-top': 'none', // Border oben entfernen
              'border-bottom': 'none' // Border unten entfernen
            });
          }
        });
      });

      // Tooltip positionieren und sicherstellen, dass er nicht außerhalb des Bildschirms liegt
      bar.mousemove(function (event) {
        const tooltipWidth = tooltip.outerWidth();
        const tooltipHeight = tooltip.outerHeight();
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        let leftPosition = event.pageX + 15;
        if (leftPosition + tooltipWidth > windowWidth) {
          leftPosition = windowWidth - tooltipWidth - 15;
        }

        let topPosition = event.pageY + 15;
        if (topPosition + tooltipHeight > windowHeight) {
          topPosition = windowHeight - tooltipHeight - 15;
        }

        tooltip.css({
          'left': leftPosition,
          'top': topPosition
        });
      });

      renderer.append(bar);
    });

    xPosIndex++;
  }
}

function drawTreeMap() {
  toggleState = "treemap";
  renderer.empty();

  let treemap = new Treemap(0, 0, stageWidth, stageHeight, {
    order: 'sort',
    direction: 'both',
  });

  console.log(treemapData);
  treemap.addData(treemapData, { value: "count" });
  treemap.calculate();

  const parentTerms = [
    "Mechanical problems",
    "Accidents and collisions",
    "Fuel and energy problems",
    "Safety and not technical problems",
    "Other",
    "Driver-related problems"
  ];

  treemap.draw(function (item) {
    let div = document.createElement('div');
    div.setAttribute('class', 'treemap-item');
    div.style.left = item.x + "px";
    div.style.top = item.y + "px";
    div.style.width = (item.w - 2) + "px";
    div.style.height = (item.h - 2) + "px";
    div.style.borderRadius = "4px";
    div.style.border = "none";
    div.style.opacity = 0;
    div.style.transition = "opacity 0.5s ease-in-out";

    if (item.depth === 0) {
      let parentIndex = item.parent.index;
      div.style.backgroundColor = colorsTree[parentIndex];
    }

    // Tooltip-Element
    const tooltip = $('<div></div>');
    tooltip.addClass('tooltip');
    $('body').append(tooltip);
    tooltip.hide();

    if (item.depth == 0) {
      $(div).hover(
        function () {
          let parentIndex = item.parent.index;
          tooltip.html(`<b>${parentTerms[parentIndex]}</b><br>Status: <b>${item.data.status}</b><br>Frequency: <b>${item.data.count}</b>`);
          tooltip.show();
          $(this).css({
            transform: 'scale(1.06)',
            boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.4)',
            border: '1px solid black',
            zIndex: 1000
          });
        },
        function () {
          tooltip.hide();
          $(this).css({
            transform: 'scale(1)',
            boxShadow: 'none',
            border: 'none',
            zIndex: 1,
            cursor: 'default'
          });
        }
      );

      $(div).mousemove(function (e) {
        const tooltipWidth = tooltip.outerWidth();
        const tooltipHeight = tooltip.outerHeight();
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        let leftPosition = e.pageX + 10;
        if (leftPosition + tooltipWidth > windowWidth) {
          leftPosition = windowWidth - tooltipWidth - 10;
        }

        let topPosition = e.pageY + 10;
        if (topPosition + tooltipHeight > windowHeight) {
          topPosition = windowHeight - tooltipHeight - 10;
        }

        tooltip.css({
          left: leftPosition + 'px',
          top: topPosition + 'px'
        });
      });
    };
    document.querySelector('#renderer').appendChild(div);

    setTimeout(() => {
      div.style.opacity = 1;
    }, 50 + item.index * 50);
  });
}

function changeView() {
  $('#renderer').empty();
  if (toggleState === "map") {
    toggleState = "treemap";
    drawTreeMap();
  } else if (toggleState === "treemap") {
    toggleState = "map";
    drawConstructorMap();
  }
}


