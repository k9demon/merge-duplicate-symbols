// disable the context menu (eg. the right click menu) to have a more native feel
// document.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
// })
var globalTextStyles;
var globalGroupedTextStyles;
var mapping = [];


function sortOnKeys(dict) {
  var sorted = [];
  for (var key in dict) {
    sorted[sorted.length] = key;
  }
  sorted.sort();
  var tempDict = {};
  for (var i = 0; i < sorted.length; i++) {
    tempDict[sorted[i]] = dict[sorted[i]];
  }

  return tempDict;
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

window.BuildMapping = () => {
  mapping = [];
  Object.keys(globalGroupedTextStyles).forEach(function (key) {
    var groupOfStyles = globalGroupedTextStyles[key];
    for (var i = 0; i < groupOfStyles.length; i++) {
      mapping.push(globalTextStyles.indexOf(groupOfStyles[i]));
    }
  });
}

window.DrawStyleList = (textStyles) => {
  globalTextStyles = textStyles;
  const groupByLibraryName = groupBy('libraryName');
  var groupedTextStyles = groupByLibraryName(textStyles);
  groupedTextStyles = sortOnKeys(groupedTextStyles);
  globalGroupedTextStyles = groupedTextStyles;
  BuildMapping();
  var inner = "";
  var groupnum = 0;
  var stylenum = 0;
  Object.keys(groupedTextStyles).forEach(function (key) {
    var groupOfStyles = groupedTextStyles[key];

    inner += `<div id="groupStyleHeader${groupnum}" class="rowAuto horizontalLayout groupHeader" onClick="onExpanderClicked(${groupnum})">
                <div class="colAvailable alignVerticalCenter"><span class="">${key}</span></div>
                <div class="colAuto expanderIcon">
                  <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                      <!-- Generator: Sketch 61.2 (89653) - https://sketch.com -->
                      <title>Page 1</title>
                      <desc>Created with Sketch.</desc>
                      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                          <g id="Artboard">
                              <path d="M17.3273272,9.26005993 C17.7359848,8.888553 18.3684331,8.91866959 18.7399401,9.32732721 C19.0828695,9.70454962 19.0835873,10.2724576 18.7602482,10.6497962 L18.6726728,10.7399401 L12.4999929,16.3514608 L6.32732721,10.7399401 C5.91866959,10.3684331 5.888553,9.73598482 6.26005993,9.32732721 C6.6029894,8.95010479 7.16825947,8.89542621 7.57461521,9.18144646 L7.67267279,9.26005993 L12.499,13.649 L17.3273272,9.26005993 Z" id="Path" fill="#979797" fill-rule="nonzero"></path>
                          </g>
                      </g>
                  </svg>
                </div>
              </div>`;

    inner += `<div id="groupStyleList${groupnum}" class="rowAuto expanderContent">`;

    for (var i = 0; i < groupOfStyles.length; i++) {
      var checked = groupOfStyles[i].isSelected ? "checked" : "";

      var checkbox = `<div class="squareCheckbox">
        <input type="checkbox" ${checked} id="chkTextStyleItem${stylenum}"/>
        <label></label>
        <span>${groupOfStyles[i].name}</span>
      </div>`;

      inner += `<div id="textStyleItem${stylenum}" onclick="onTextStyleItemChanged(${stylenum})" class="leftPanelListItem alignVerticalCenter">${checkbox} </div>`
      stylenum++;
    }

    inner += `</div>`;
    groupnum++;

  });

  var lstTextStyles = document.getElementById('lstTextStyles');
  lstTextStyles.innerHTML = inner;

  clearWorkzone();
}

window.onExpanderClicked = (index) => {
  var groupStyleHeader = document.getElementById("groupStyleHeader" + index);
  var groupStyleList = document.getElementById("groupStyleList" + index);
  if (groupStyleHeader.className.toString().indexOf("collapsed") >= 0) {
    groupStyleHeader.className = "rowAuto horizontalLayout groupHeader";
    groupStyleList.className = "rowAuto expanderContent";
  }
  else {
    groupStyleHeader.className = "rowAuto horizontalLayout groupHeader collapsed";
    groupStyleList.className = "rowAuto expanderContent notDisplayed";
  }
}

window.onTextStyleItemChanged = (index) => {
  var realIndex = mapping[index];
  globalTextStyles[realIndex].isSelected = !globalTextStyles[realIndex].isSelected;
  var selectedDiv = document.getElementById("textStyleItem" + index);
  var selectedCheck = document.getElementById("chkTextStyleItem" + index);
  var selected = globalTextStyles[realIndex].isSelected ? "selected" : "";
  selectedDiv.className = "leftPanelListItem alignVerticalCenter " + selected;
  selectedCheck.checked = globalTextStyles[realIndex].isSelected;

  for (var i = 0; i < globalTextStyles.length; i++) {
    globalTextStyles[i].isChosen = false;
  }

  DrawSelectedStylesList();
}

window.clearWorkzone = () => {
  document.getElementById('emptyState').className = "emptyState fadeIn";
  document.getElementById("workZoneTitle").className = "colAvailable verticalLayout movingYFadeInitialState movingYFadeOut";
  listOfStyles.className = "scrollable movingYFadeInitialState workZone movingYFadeOut";
  document.getElementById('lblIncludeLibraries').innerHTML = "Include all enabled libraries styles";
}

window.onStyleClicked = (index) => {
  var realIndex = mapping[index];

  var stylenum = 0;
  Object.keys(globalGroupedTextStyles).forEach(function (key) {
    var groupOfStyles = globalGroupedTextStyles[key];
    for (var i = 0; i < groupOfStyles.length; i++) {
      if (groupOfStyles[i].isSelected) {
        var otherCheck = document.getElementById("workZoneItemCheck" + stylenum);
        var otherStyle = document.getElementById("workZoneStyle" + stylenum);
        otherCheck.checked = false;
        otherStyle.className = "thumbnailContainer symbolPreview horizontalLayout alignVerticalCenter";
      }
      groupOfStyles[i].isChosen = false;
      stylenum++;
    }
  });

  var selectedCheck = document.getElementById("workZoneItemCheck" + index);
  var selectedStyle = document.getElementById("workZoneStyle" + index);
  selectedCheck.checked = true;
  selectedStyle.className = "thumbnailContainer symbolPreview horizontalLayout alignVerticalCenter selected";
  globalTextStyles[realIndex].isChosen = true;

  var btnMerge = document.getElementById('btnMerge');
  btnMerge.disabled = false;
}

window.DrawSelectedStylesList = () => {
  var inner = "";
  var counter = 0;

  var stylenum = 0;
  Object.keys(globalGroupedTextStyles).forEach(function (key) {
    var groupOfStyles = globalGroupedTextStyles[key];
    for (var i = 0; i < groupOfStyles.length; i++) {
      if (groupOfStyles[i].isSelected) {
        var selected = groupOfStyles[i].isChosen ? "selected" : "";
        var checked = groupOfStyles[i].isChosen ? "checked" : "";

        var checkbox = `<div class="colAuto roundCheckbox">
                          <input type="checkbox" ${checked} id="workZoneItemCheck${stylenum}"/>
                          <label></label>
                        </div>`;


        var contrastMode = groupOfStyles[i].contrastMode ? "bgContrastMode" : "";

        inner += `<div id="workZoneStyle${stylenum}" class="thumbnailContainer symbolPreview horizontalLayout alignVerticalCenter ${selected}" onclick="onStyleClicked(${stylenum})">
                  ${checkbox}
                  <div class="colAvailable verticalLayout thumbnailData" id="workZoneStyleThumbnail${stylenum}" >
                    <div class="rowAvailable padded ${contrastMode}"><div class="thumbnail" style='background-image:url("${groupOfStyles[i].thumbnail}")'></div></div>
                    <div class="rowAuto primaryText displayFlex"><span class="alignHorizontalCenter">${groupOfStyles[i].name} (${groupOfStyles[i].libraryName})</span></div>
                    <div class="rowAuto secondaryText displayFlex"><span class="alignHorizontalCenter">${groupOfStyles[i].description}</span></div>
                  </div>
                </div>`;

        counter++;
      }
      stylenum++;
    }
  });


  var listOfStyles = document.getElementById('listOfStyles');
  var workZoneTitle = document.getElementById("workZoneTitle");

  if (counter > 0) {
    document.getElementById('emptyState').className = "emptyState fadeOut";
    workZoneTitle.className = "colAvailable verticalLayout movingYFadeInitialState movingYFadeIn";
    listOfStyles.innerHTML = inner;
    listOfStyles.className = "scrollable movingYFadeInitialState workZone movingYFadeIn";
    document.getElementById('lblIncludeLibraries').innerHTML = "Include all enabled libraries styles (you may lose the current selection)";
  }
  else {
    clearWorkzone();
  }
}

window.cancelAssignation = () => {
  window.postMessage('Cancel');
}

document.getElementById('btnCancel').addEventListener("click", () => {
  cancelAssignation();
});

document.getElementById('btnMerge').addEventListener("click", () => {
  window.postMessage('ExecuteMerge', globalTextStyles);
});

document.getElementById('chkIncludeLibraries').addEventListener("click", () => {
  var check = document.getElementById('chkIncludeLibraries');
  if (check.checked)
    window.postMessage('GetAllStylesList');
  else
    window.postMessage('GetLocalStylesList');
});



