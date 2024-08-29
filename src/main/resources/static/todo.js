$(document).ready(function () {

    let startDate = 0;
    let endDate = Math.floor(new Date().getTime());
    let sorting = null;
    let sortingBtnClicked = 0;
    let query = null;
    let limit = null;
    let offset = null;
    let dateMode = false;
    let searchMode = false;

    $("#startDate, #endDate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd-mm-yy",
        onSelect: function () {
            dateMode = true;
            const startDateDatepicker = $("#startDate").datepicker("getDate");
            const endDateDatepicker = $("#endDate").datepicker("getDate");

            if (startDateDatepicker && endDateDatepicker) {
                startDate = Math.floor(startDateDatepicker.getTime());
                endDate = Math.floor(endDateDatepicker.getTime());

                loadTasks({ from: startDate, to: endDate, limit: limit, offset: offset }, false, true);
            }
        },
    });

    $("#taskModal").dialog({
        autoOpen: false,
        width: 400,
        modal: true,
    });

    function loadTasks(params = {}, searchMode = false, dateMode = false) {
        let url = "http://localhost:8080/api/todos";
        if (searchMode) {
            url += "/find";
        } else if (dateMode) {
            url += "/date";
        }

        $.ajax({
            url: url,
            method: "GET",
            data: params,
            success: function (response) {
                $("#tasksList").empty();
                response.forEach((task) => {
                    const taskItem = `
                      <div class="task-item" data-id="${task.id}">
                          <div class="todo-info">
                              <p class="task-title">${task.name}</p>
                              <p>${task.shortDesc}</p>
                          </div>
                          <div class="done-task-checkbox">
                              <span class="task-date">${new Date(
                        task.date
                    ).toLocaleString()}</span>
                              <input type="checkbox" class="task-checkbox" ${
                        task.status ? "checked" : ""
                    }>
                          </div>
                      </div>
                  `;
                    $("#tasksList").append(taskItem);
                });
            },
            error: function (error) {
                console.error("Error fetching tasks:", error);
            },
        });
    }

    loadTasks();

    $("#searchInput").on("input", function () {
        searchMode = true;
        $("#startDate, #endDate").datepicker("setDate", null);
        $("#incompleteTasks").prop("checked", false);
        query = $(this).val();
        loadTasks({ q: query, limit: limit, offset: offset }, true, false);
    });

    $("#limitInput").on("input", function () {
        $("#incompleteTasks").prop("checked", false);
        limit = $(this).val();
        makeAQuery();
    });

    $("#offsetInput").on("input", function () {
        $("#incompleteTasks").prop("checked", false);
        offset = $(this).val();
        makeAQuery();
    });

    $("#todayBtn").click(function () {
        dateMode = true;
        $("#startDate, #endDate").datepicker("setDate", null);
        $("#incompleteTasks").prop("checked", false);
        startDate = endDate = Math.floor(new Date().getTime());
        loadTasks({ from: startDate, to: endDate, limit: limit, offset: offset }, false, true);
    });

    $("#weekBtn").click(function () {
        dateMode = true;
        $("#startDate, #endDate").datepicker("setDate", null);
        $("#incompleteTasks").prop("checked", false);
        const today = new Date();
        startDate = Math.floor(
            new Date(today.setDate(today.getDate() - today.getDay() + 1)).getTime()
        );
        endDate = Math.floor(
            new Date(today.setDate(today.getDate() - today.getDay() + 7)).getTime()
        );
        loadTasks({ from: startDate, to: endDate, limit: limit, offset: offset }, false, true);
    });

    $("#sortByDateBtn").click(function () {
        sortingBtnClicked += 1;
        sortingBtnClicked % 2 === 0 ? sorting = true : sorting = false;
        loadTasks({ from: startDate, to: endDate, sorting: sorting, limit: limit, offset: offset }, false, true);
    });

    $("#incompleteTasks").change(function () {
        const showIncomplete = $(this).is(":checked");
        let status;
        if (showIncomplete === true) status = false;
        else status = null;
        loadTasks({ from: startDate, to: endDate, status: status, limit: limit, offset: offset }, false, true);
    });

    $(document).on("click", ".task-item", function () {
        const taskId = $(this).data("id");
        $.ajax({
            url: `http://localhost:8080/api/todos/${taskId}`,
            method: "GET",
            success: function (response) {
                $("#taskTitle").text(response.name);
                $("#taskDate").text(new Date(response.date).toLocaleString());
                $("#taskDescription").text(response.fullDesc);
                $("#incompleteTask").prop("checked", response.status);

                $("#bgForTask").css("display", "block");
                $("#taskDetails").show();
            },
            error: function (error) {
                console.error("Error fetching task details:", error);
            },
        });
    });

    $("#taskDetailsCloseBtn").click(function () {
        $("#bgForTask").css("display", "none");
        $("#taskDetails").hide();
    });

    $("#resetBtn").click(function () {
        reset();
    });

    function makeAQuery() {
        if (searchMode === false && dateMode === false) loadTasks({ limit: limit, offset: offset }, false, false);
        else if (searchMode === true && dateMode === false) loadTasks({ q: query, limit: limit, offset: offset }, true, false);
        else if (searchMode === false && dateMode === true) loadTasks({ from: startDate, to: endDate, limit: limit, offset: offset }, false, true);
    }

    function reset() {
        startDate = 0;
        endDate = Math.floor(new Date().getTime());
        query = null;
        limit = null;
        offset = null;
        sorting = null;
        dateMode = false;
        searchMode = false;
        $("#limitInput").prop("value", null);
        $("#offsetInput").prop("value", null);
        $("#searchInput").prop("value", null);
        $("#incompleteTasks").prop("checked", false);
        loadTasks();
    }

});
