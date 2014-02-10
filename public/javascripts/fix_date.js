$(function() {
  // fixing date from UST to machine local time
  $(".say-wrapper").each(function() {
    var data_date = $(this).attr("data-date");
    var local_date = new Date(data_date);
    $(this).attr("data-date", local_date);
    var date_str = local_date.getFullYear() + "/"
      + (local_date.getMonth() + 1) + "/"
      + (local_date.getDate()) + " "
      + (local_date.getHours()) + ":" + local_date.getMinutes();
    $(this).find(".date-sentence").html(date_str)
      .attr("title", date_str);
  });
});
