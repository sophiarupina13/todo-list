$(document).ready(function () {
    $("#dateRangePicker").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd-mm-yy",
    });

    $("#taskModal").dialog({
        autoOpen: false,
        width: 400,
        modal: true,
    });

    function loadTasks(params = {}, searchMode = false) {
        let url = "http://localhost:8080/api/todos";
        if (searchMode) {
            url += "/find";
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
        const query = $(this).val();
        loadTasks({ q: query }, true);
    });

    $("#todayBtn").click(function () {
        const today = Math.floor(new Date().getTime() / 1000);
        loadTasks({ from: today, to: today });
    });

    $("#weekBtn").click(function () {
        const today = new Date();
        const firstDayOfWeek = Math.floor(
            new Date(today.setDate(today.getDate() - today.getDay())).getTime() / 1000
        );
        const lastDayOfWeek = Math.floor(
            new Date(today.setDate(today.getDate() - today.getDay() + 6)).getTime() /
            1000
        );
        loadTasks({ from: firstDayOfWeek, to: lastDayOfWeek });
    });

    $("#sortByDateBtn").click(function () {
        loadTasks({ sort: "date" });
    });

    $("#incompleteTasks").change(function () {
        const showIncomplete = $(this).is(":checked");
        loadTasks({ status: !showIncomplete });
    });

    $(document).on("click", ".task-item", function () {
        const taskId = $(this).data("id");
        $.ajax({
            url: `http://localhost:8080/api/todos/${taskId}`,
            method: "GET",
            success: function (task) {
                $("#modalTaskTitle").text(task.name);
                $("#modalTaskDescription").text(task.fullDesc);
                $("#taskModal").dialog("open");
            },
            error: function (error) {
                console.error("Error fetching task details:", error);
            },
        });
    });
});
