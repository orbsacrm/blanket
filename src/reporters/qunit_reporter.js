window.defaultReporter = function(coverage){
    var cssSytle = "#blanket-main {margin:2px;background:#EEE;color:#333;clear:both;font-family:'Helvetica Neue Light', 'HelveticaNeue-Light', 'Helvetica Neue', Calibri, Helvetica, Arial, sans-serif; font-size:17px;} #blanket-main a {color:#333;text-decoration:none;}  #blanket-main a:hover {text-decoration:underline;} .blanket {margin:0;padding:5px;clear:both;border-bottom: 1px solid #FFFFFF;} .bl-error {color:red;}.bl-success {color:#5E7D00;} .bl-file{width:auto;} .bl-cl{float:left;} .blanket div.rs {margin-left:50px; width:150px; float:right} .bl-nb {padding-right:10px;} #blanket-main a.bl-logo {color: #EB1764;cursor: pointer;font-weight: bold;text-decoration: none} .bl-source{ overflow-x:scroll; background-color: #FFFFFF; border: 1px solid #CBCBCB; color: #363636; margin: 25px 20px; width: 80%;} .bl-source div{white-space: pre;font-family: monospace;} .bl-source > div > span:first-child{background-color: #EAEAEA;color: #949494;display: inline-block;padding: 0 10px;text-align: center;width: 30px;} .bl-source .miss{background-color:#e6c3c7} .bl-source span.branchWarning{color:#000;background-color:yellow;} .bl-source span.branchOkay{color:#000;background-color:transparent;}",
        successRate = 60,
        head = document.head,
        fileNumber = 0,
        body = document.body,
        headerContent,
        hasBranchTracking = false,
        bodyContent = "<div id='blanket-main'><div class='blanket bl-title'><div class='bl-cl bl-file'><a href='http://alex-seville.github.com/blanket/' target='_blank' class='bl-logo'>Blanket.js</a> results</div><div class='bl-cl rs'>Coverage (%)</div><div class='bl-cl rs'>Covered/Total Smts.</div>"+(hasBranchTracking ? "<div class='bl-cl rs'>Covered/Total Branches</div>":"")+"<div style='clear:both;'></div></div>",
        fileTemplate = "<div class='blanket {{statusclass}}'><div class='bl-cl bl-file'><span class='bl-nb'>{{fileNumber}}.</span><a href='javascript:blanket_toggleSource(\"file-{{fileNumber}}\")'>{{file}}</a></div><div class='bl-cl rs'>{{percentage}} %</div><div class='bl-cl rs'>{{numberCovered}}/{{totalSmts}}</div>"+( hasBranchTracking ? "<div class='bl-cl rs'>{{passedBranches}}/{{totalBranches}}</div>" : "" )+"<div id='file-{{fileNumber}}' class='bl-source' style='display:none;'>{{source}}</div><div style='clear:both;'></div></div>";
        grandTotalTemplate = "<div class='blanket grand-total {{statusclass}}'><div class='bl-cl'>{{rowTitle}}</div><div class='bl-cl rs'>{{percentage}} %</div><div class='bl-cl rs'>{{numberCovered}}/{{totalSmts}}</div>"+( hasBranchTracking ? "<div class='bl-cl rs'>{{passedBranches}}/{{totalBranches}}</div>" : "" ) + "<div style='clear:both;'></div></div>";

    function blanket_toggleSource(id) {
        var element = document.getElementById(id);
        if(element.style.display === 'block') {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }


    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = blanket_toggleSource.toString().replace('function ' + blanket_toggleSource.name, 'function blanket_toggleSource');
    body.appendChild(script);

    var percentage = function(number, total) {
        return (Math.round(((number/total) * 100)*100)/100);
    };

    var appendTag = function (type, el, str) {
        var dom = document.createElement(type);
        dom.innerHTML = str;
        el.appendChild(dom);
    };

    function escapeInvalidXmlChars(str) {
        return str.replace(/\&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;");
    }

    function isBranchFollowed(data,bool){
        var mode = bool ? 0 : 1;
        if (typeof data === 'undefined' ||
            typeof data === null ||
            typeof data[mode] === 'undefined'){
            return false;
        }
        return data[mode].length > 0;
    }

    

    var isUndefined =  function(item){
            return typeof item !== 'undefined';
      };

    var files = coverage;
    var totals = {
      totalSmts: 0,
      numberOfFilesCovered: 0,
      passedBranches: 0,
      totalBranches: 0,
      moduleTotalStatements : {},
      moduleTotalCoveredStatements : {},
      moduleTotalBranches : {},
      moduleTotalCoveredBranches : {}
    };

    // check if a data-cover-modulepattern was provided for per-module coverage reporting
    var modulePattern;
    var modulePatternRegex = ( modulePattern ? new RegExp(modulePattern) : null );
    
    for(var file in files)
    {
        fileNumber++;

        var statsForFile = files[file],
            totalSmts = 0,
            numberOfFilesCovered = 0,
            code = [],
            i;
        

        var end = [];
        for(i = 0; i < statsForFile.code.length; i +=1){
            var src = statsForFile.code[i];
            
            
              src = escapeInvalidXmlChars(src);
              
              var lineClass="";
              if(statsForFile.l[i+1] > 0) {
                numberOfFilesCovered += 1;
                totalSmts += 1;
                lineClass = 'hit';
              }else{
                if(statsForFile.l[i+1] === 0){
                    totalSmts++;
                    lineClass = 'miss';
                }
              }
              code[i+1] = "<div class='"+lineClass+"'><span class=''>"+(i + 1)+"</span>"+src+"</div>";
        }
        totals.totalSmts += totalSmts;
        totals.numberOfFilesCovered += numberOfFilesCovered;
        
       
        // if "data-cover-modulepattern" was provided, 
        // track totals per module name as well as globally
        if (modulePatternRegex) {
            var moduleName = file.match(modulePatternRegex)[1];

            if(!totals.moduleTotalStatements.hasOwnProperty(moduleName)) {
                totals.moduleTotalStatements[moduleName] = 0;
                totals.moduleTotalCoveredStatements[moduleName] = 0;
            }

            totals.moduleTotalStatements[moduleName] += totalSmts;
            totals.moduleTotalCoveredStatements[moduleName] += numberOfFilesCovered;

            if(!totals.moduleTotalBranches.hasOwnProperty(moduleName)) {
                totals.moduleTotalBranches[moduleName] = 0;
                totals.moduleTotalCoveredBranches[moduleName] = 0;
            }

            totals.moduleTotalBranches[moduleName] += totalBranches;
            totals.moduleTotalCoveredBranches[moduleName] += passedBranches;            
        }

        var result = percentage(numberOfFilesCovered, totalSmts);

        var output = fileTemplate.replace("{{file}}", file)
                                 .replace("{{percentage}}",result)
                                 .replace("{{numberCovered}}", numberOfFilesCovered)
                                 .replace(/\{\{fileNumber\}\}/g, fileNumber)
                                 .replace("{{totalSmts}}", totalSmts)
                                 .replace("{{source}}", code.join(" "));
        if(result < successRate)
        {
            output = output.replace("{{statusclass}}", "bl-error");
        } else {
            output = output.replace("{{statusclass}}", "bl-success");
        }
        bodyContent += output;
    }

    // create temporary function for use by the global totals reporter, 
    // as well as the per-module totals reporter
    var createAggregateTotal = function(numSt, numCov, numBranch, numCovBr, moduleName) {

        var totalPercent = percentage(numCov, numSt);
        var statusClass = totalPercent < successRate ? "bl-error" : "bl-success";
        var rowTitle = ( moduleName ? "Total for module: " + moduleName : "Global total" );
        var totalsOutput = grandTotalTemplate.replace("{{rowTitle}}", rowTitle)
            .replace("{{percentage}}", totalPercent)
            .replace("{{numberCovered}}", numCov)
            .replace("{{totalSmts}}", numSt)
            .replace("{{statusclass}}", statusClass);

        bodyContent += totalsOutput;
    };

    // if "data-cover-modulepattern" was provided, 
    // output the per-module totals alongside the global totals    
    if (modulePatternRegex) {
        for (var thisModuleName in totals.moduleTotalStatements) {
            if (totals.moduleTotalStatements.hasOwnProperty(thisModuleName)) {

                var moduleTotalSt = totals.moduleTotalStatements[thisModuleName];
                var moduleTotalCovSt = totals.moduleTotalCoveredStatements[thisModuleName];

                var moduleTotalBr = totals.moduleTotalBranches[thisModuleName];
                var moduleTotalCovBr = totals.moduleTotalCoveredBranches[thisModuleName];

                createAggregateTotal(moduleTotalSt, moduleTotalCovSt, moduleTotalBr, moduleTotalCovBr, thisModuleName);
            }
        }        
    }

    createAggregateTotal(totals.totalSmts, totals.numberOfFilesCovered, totals.totalBranches, totals.passedBranches, null);
    bodyContent += "</div>"; //closing main


    appendTag('style', head, cssSytle);
    //appendStyle(body, headerContent);
    if (document.getElementById("blanket-main")){
        document.getElementById("blanket-main").innerHTML=
            bodyContent.slice(23,-6);
    }else{
        appendTag('div', body, bodyContent);
    }
    //appendHtml(body, '</div>');
};