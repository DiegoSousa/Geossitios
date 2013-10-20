var mapCenter;
var infowindow;
var map;
var locais = new Array();
var numLocais = 0;
var fotoSaibaMaisSlide;
var fotoSaibaMaisInfoWindows;            
                        
function Imagem(){
    this.id = 0;
    this.desc;
    this.file;
}
                        
function Local(){
    this.id = 0;
    this.nome;
    this.desc;
    this.latlng;
    this.fav;
    this.marker;
    this.imagens = new Array();
    this.numImagens = 0;
    this.site;
    this.video;               
    this.imagemLightboxInfoWindow;
    this.imagemLightboxSlide;
    this.content;
}
                            
function initialize() {
    var myOptions = {
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        panControl: false,//bola de movimentação do mapa
        mapTypeControl: true,//tipo de mapa, terr
        overviewMapControl: true,//preview do mapa
        streetViewControl: false,//boneco de visualização apurada(fica em cima do zoom)
        zoomControlOptions: {
          style:google.maps.ZoomControlStyle.SMALL
        },        
        overviewMapControlOptions: {//pequeno map visualizador        
        opened: true,
        position: google.maps.ControlPosition.TOP_RIGHT//NÃO TA FUNCIONANDO
      },
        mapTypeControlOptions: {//opções do controle de tipo de mapa, terrain, satelit..
        position: google.maps.ControlPosition.TOP_LEFT, 
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      navigationControlOptions: {//opções do control zoom
        position: google.maps.ControlPosition.LEFT_TOP        
      }
      
    }
                                
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                
    downloadUrl("nodes.xml", function(data) {
        var center = data.documentElement.getElementsByTagName("map");
        mapCenter = new google.maps.LatLng(parseFloat(center[0].getAttribute("lat")),
            parseFloat(center[0].getAttribute("lng")));//
        map.setCenter(mapCenter);

        var markers = data.documentElement.getElementsByTagName("local");//conjunto de tags locais
                    
        for (var i = 0; i < markers.length; i++) {//for que percorre as tags locais                        
            //----------Setando os atributos da Tag local------------
            var l = new Local();                        
            l.latlng = new google.maps.LatLng(parseFloat(markers[i].getAttribute("lat")),parseFloat(markers[i].getAttribute("lng")));
            l.nome = markers[i].getAttribute("nome");
            l.desc = markers[i].getAttribute("desc");
            l.fav = markers[i].getAttribute("fav");
            l.video = markers[i].getAttribute("video");
            l.site = markers[i].getAttribute("site");
            l.imagemLightboxSlide = '';//zerando o atributo
            fotoSaibaMaisInfoWindows = '';//zerando o atributo
            fotoSaibaMaisSlide = '';//zerando o atributo
            var extras = '';//Atributos do SaibaMais - foto, video e sites                                                                                                                  
            //tagImagem irá guarda todas as tag image que está dentro de cada local(markers).
            var tagImagem = markers[i].getElementsByTagName("image");                       

            for(var j=0; j < tagImagem.length;j++){//for que percorre as tags image de cada tag local.
                //----------Setando os atributos da Tag image------------
                var imagem = new Imagem();                            
                imagem.id = tagImagem[j].getAttribute("id");
                imagem.file = tagImagem[j].getAttribute("file");
                imagem.desc = tagImagem[j].getAttribute("desc");                            
                            
                if(l.fav == imagem.id){//Condição para setar a imagem do infoWindow e a primeira imagem do Slide
                                
                    l.imagemLightboxInfoWindow = '<a href="'+ imagem.file + '" rel="lightbox[geo"'+ l.id + '"]"  title="'+ imagem.desc + '">'//imagem inicial slideshow + 1° imagem infowindow
                    + '<img src="'+ imagem.file +'" id="imagemInfoWindow" title="Clique aqui para ver mais fotos!"/></a>';//imagens slideshow
                    //imagens do SaibaMaisFotos para infoWindow   
                    fotoSaibaMaisInfoWindows = '<a href="'+ imagem.file + '" rel="lightbox2[ge"'+ l.id + '"]" title="'+ imagem.desc + '">'//imagem inicial slideshow + 1° imagem infowindow
                    + '<img src="icon/foto.png" alt="Mais fotos" title="Foto Relacionada"/></a>'//imagens slideshow
                               
                }else{
                    l.imagemLightboxSlide += '<a href="'+ imagem.file + '" rel="lightbox[geo"'+ l.id + '"]" title="'+ imagem.desc + '"></a>'
                    //imagens do do SaibaMaisFotos para o Slide
                    fotoSaibaMaisSlide += '<a href="'+ imagem.file + '" rel="lightbox2[ge"'+ l.id + '"]" title="'+ imagem.desc + '"></a>'
                }
                //apenas um contador, não usado ainda.
                l.imagens[l.numImagens] = imagem;
                ++l.numImagens;
            }                         
            //String que concatena tos os dados de cada geositio.
            l.content = '<div><div id="tituloInfoWindow">'+ l.nome +'</div><br>'+//titulo do infowindow
            '<table>'+
            '<td>'+ l.imagemLightboxInfoWindow + l.imagemLightboxSlide +'</td>'+//imagem do infowindow
            '<td>" "</td>'+//espaço entre a foto e o texto
            '<td><div id=textInfoWindow>'+ l.desc+'</div></td>'+//descrição do infowindow
            '</table></div>';                                                                                                                                             
                        
            //Bloco que será criado os extras(SaibaMais) de cada InfoWindow
            extras = fotoSaibaMaisInfoWindows + fotoSaibaMaisSlide;//FotosExtra
                        
            if((l.site != "") && (l.site != null)){
                //target=\"_blank\" - ao clicar em site ou video abre uma nova pagina. sem ele carregaria o link na pagina geossitio
                extras += '<a href="'+ l.site + '" target=\"_blank\">'
                +'<img src="icon/site.png" title="site relacionado"></a>';
            }
                        
            if((l.video != "") && (l.video != null)){
                extras += '<a href="'+ l.video + ' "target=\"_blank\">'
                +'<img src="icon/video.png" title="video relacionado"></a>';
            }
                              
            if (extras != ""){
                l.content += '<div id="saibaMaisInfoWindow"> Saiba mais:</div>' + extras;
            }                       
            //vetor de todos os locais
            locais[numLocais] = l;
            ++numLocais;                                                                   
        }

        for(var i = 0; i< numLocais; ++i){
            var l = locais[i];
            l.marker = createMarker(l.content, l.latlng);
        }
    });
}

function createMarker(cont, latlng) {
                
    var marker = new google.maps.Marker({
        position: latlng, 
        map: map
    });

    google.maps.event.addListener(marker, "click", function() {
        if (infowindow) infowindow.close();

        createInfoWindow(cont, marker);

    });
    return marker;
}

function createInfoWindow(cont, marker){
    infowindow = new google.maps.InfoWindow({
        content: cont
    });
    infowindow.open(map, marker);
}
            