var mongo = require('mongodb');

var db = new mongo.Db('train', new mongo.Server('localhost', 27017), {safe: true});

db.open(function (err) {
  if(err){ console.log(err); }
  else{
    console.log('MongoDB Połączono!');

    db.collection('test5', function (err, coll) {
      if(err){
        db.close();
        console.log(err); 
      }
      else{
        var cursor = coll.find();
        var tagsCount = 0;
        var itemsCount = 0;
        var updatesCount = 0;
        var updatedCount = 0;
        var tags = {};
        var diffTags = 0;

        cursor.each(function(err, item) {
          if(err){
            db.close();
            console.log(err); 
          }
          else if(item === null){

              //czekamy aż mongo zakończy updaty
              var interval = setInterval( function(){
                if(updatesCount !== updatedCount){
                  console.log("Czekam na wszystkie update-y...");
                }
                else{
                  clearInterval(interval);
                  db.close();
                  console.log("Update-y zakończone.");
                  console.log('MongoDB Rozłączone!');
                  console.log("ilość obiektów: " + itemsCount);
                  console.log("ilość updateów: " + updatesCount);
                  console.log("   ilość tagów: " + tagsCount);
                  console.log(" różnych tagów: " + diffTags);
                }
              }, 500);
          }
          else{
            itemsCount++;
            if(item.Tags.constructor === String){
              // console.log("id: " + item.Id + " tags: " + item.Tags );
              //rozdzielamy string do tablicy
              var tagsSplited = item.Tags.split(" "); 
              tagsCount += tagsSplited.length;
              //zliczanie różnych tagów
              for(var i=0; i < tagsSplited.length; i++){
                if(tags[tagsSplited[i]] === undefined){
                  tags[tagsSplited[i]] = true; //cokolwiek byle pole było defined
                  diffTags++;
                }
              }
              //zamiana stringa na tablicę w bazie
              coll.update({Id: item.Id}, {$set: {Tags: tagsSplited}}, function(err){
                if(err) { console.log(err); }
                else{
                  updatedCount++; //liczymy wykonane update-y
                }
              });
              updatesCount++; //liczymy ilość update-ów do wykonania
            }
          }
        });
      }
    });
  }
});