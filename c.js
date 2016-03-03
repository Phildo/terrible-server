var client = function(error_func)
{
  var self = this;

  self.server_url = "http://mydomain.com/whyamiusingthis/terribleserver/s.php";
  self.poll_rate = 3000; //ms between polls. 3000 = 3s
  self.db_i_begin = -1; //first known index of database
  self.database = [];
  var Entry = function(i,d) { this.i = i; this.data = d; }

  var getXHR = function() //to reduce code duplication out of laziness- not out of good practice
  {
    var xhr;
    xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      switch(xhr.readyState)
      {
        case 0: //UNSENT
        case 1: //OPENED
        case 2: //HEADERS_RECEIVED
        case 3: //LOADING
          break;
        case 4: //DONE
          if(xhr.status != 200 || xhr.responseText == "" || xhr.responseText == "FAIL") { error_func(); return; }
          self.got(xhr.responseText);
          break;
      }
    }
    return xhr;
  }

  self.get = function()
  {
    var xhr = getXHR();
    xhr.open("GET",self.server_url);
    xhr.send();
  }

  self.add = function(event)
  {
    var xhr = getXHR();
    xhr.open("GET",self.server_url+"?event="+event);
    xhr.send();
  }

  self.got = function(r)
  {
    //console.log(r);
    var merge_lines = r.split("\n");
    if(merge_lines.length == 0) return;
    var merge_db = [];
    for(var i = 0; i < merge_lines.length; i++)
    {
      if(!merge_lines[i]) continue;
      merge_db[i] = new Entry( parseInt(merge_lines[i].substring(0,merge_lines[i].indexOf(" "))), merge_lines[i].substring(merge_lines[i].indexOf(" ")+1) );
    }
    var merge_i_begin = merge_db[0].i;

    //first population
    if(self.db_i_begin == -1)
    {
      for(var i = 0; i < merge_db.length; i++)
        self.database[i] = merge_db[i];
      self.db_i_begin = self.database[0].i;
      return;
    }

    //check if gaps in knowledge, and fill with blank entries
    if(merge_i_begin > (self.db_i_begin + self.database.length))
    {
      while(self.db_i_begin+self.database.length < merge_i_begin)
        self.database[self.database.length] = new Entry(self.db_i_begin+self.database.length,"");
    }

    //perform the merge
    for(var i = 0; i < merge_db.length; i++)
    {
      if(merge_db[i].i > self.database[self.database.length-1].i)
        self.database[self.database.length] = merge_db[i];
    }
  }

  self.begin = function()
  {
    setInterval(self.get,self.poll_rate);
  }
}

