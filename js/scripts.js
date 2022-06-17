
$(function () {


    // *** APIs ***
    // clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
    // pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
    // pegar coordenadas do IP: http://www.geoplugin.net
    // gerar gráficos em JS: https://www.highcharts.com/demo

    // "http://dataservice.accuweather.com/currentconditions/v1/127164?apikey=AFeuPtXyxOYvALMkYbPHv7lj0xFI1CYQ&language=pt-br"

    var accuweatherAPIKey = "AFeuPtXyxOYvALMkYbPHv7lj0xFI1CYQ";

    var tempoObj = {
        cidade: "",
        estado: "",
        pais: "",
        temperatura: "",
        maxima: "",
        minima: "",
        descClima: "",
        iconeClima: ""
    };

    function popularTempo(cidade, estado, pais, temperatura, descClima, iconeClima) {

        var localTxt = cidade + ", " + estado + ". " + pais;
        $("#texto_local").text(localTxt);
        $("#texto_clima").text(descClima);
        $("#texto_temperatura").html(String(temperatura) + "&deg;");
        $("#icone_clima").css("background-image", "url('" + iconeClima + "')");

    };

    function popularTempoDiario(previsoes) {
        $("#info_5dias").html("");

        for (previsao of previsoes) {

            var diaSemana = "Dia da Semana"
            var codIcone = previsao.Day.Icon < 10 ? "0" + String(previsao.Day.Icon) : String(previsao.Day.Icon);
            iconeClima = "https://developer.accuweather.com/sites/default/files/" + codIcone + "-s.png";
            var minima = String(previsao.Temperature.Minimum.Value);
            var maxima = String(previsao.Temperature.Maximum.Value);

            elementoHtmlDiario = '<div class="day col">';
            elementoHtmlDiario += '<div class="day_inner">';
            elementoHtmlDiario += '<div class="dayname">';
            elementoHtmlDiario += diaSemana;
            elementoHtmlDiario += '</div>';
            elementoHtmlDiario += '<div style="background-image: url(\'' + iconeClima + '\')"class="daily_weather_icon"></div>';
            elementoHtmlDiario += '<div class="max_min_temp">';
            elementoHtmlDiario += minima + '&deg; / ' + maxima + '&deg;';
            elementoHtmlDiario += '</div>';
            elementoHtmlDiario += '</div>';
            elementoHtmlDiario += '</div>';

            $("#info_5dias").append(elementoHtmlDiario);
            elementoHtmlDiario = "";
        }

    };

    function buscaTempoAtual(localCode) {

        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("current cond:", data);

                tempoObj.temperatura = data[0].Temperature.Metric.Value;
                tempoObj.descClima = data[0].WeatherText

                var codIcone = data[0].WeatherIcon < 10 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);
                tempoObj.iconeClima = "https://developer.accuweather.com/sites/default/files/" + codIcone + "-s.png";

                popularTempo(tempoObj.cidade, tempoObj.estado, tempoObj.pais, tempoObj.temperatura, tempoObj.descClima, tempoObj.iconeClima);
            },
            error: function () {
                console.log("Erro");
            }
        })

    }

    function buscaTempoDiario(localCode) {

        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("diario:", data);

                $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; / " + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");

                popularTempoDiario(data.DailyForecasts);
            },
            error: function () {
                console.log("Erro");
            }
        })

    }

    function buscaLocalIP(lat, log) {
        $.ajax({
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherAPIKey + "&q=" + lat + "%2C" + log + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function (data) {

                console.log("geoposition :", data);

                try {
                    tempoObj.cidade = data.ParentCity.LocalizedName;
                }
                catch {
                    tempoObj.cidade = data.LocalizedName;
                }

                tempoObj.estado = data.AdministrativeArea.LocalizedName;
                tempoObj.pais = data.Country.LocalizedName;

                var localCode = data.Key;
                buscaTempoAtual(localCode);
                buscaTempoDiario(localCode);

            },
            error: function () {
                console.log("Erro");
            }
        })
    }

    function buscaCordenadasIP() {
        var latDefaut = -23.056639;
        var logDefaut = -46.354759;
        $.ajax({
            url: "http://www.geoplugin.net/json.gp",
            type: "GET",
            dataType: "json",
            success: function (data) {

                if (data.geoplugin_latitude && data.geoplugin_longitude) {

                    buscaLocalIP(data.geoplugin_latitude, data.geoplugin_longitude);
                } else {
                    buscaLocalIP(latDefaut, logDefaut);
                }

            },
            error: function () {
                console.log("Erro ao recuperar latitude e longitude pelo IP");
                buscaLocalIP(latDefaut, logDefaut);
            }
        })

    }

    buscaCordenadasIP();

});


