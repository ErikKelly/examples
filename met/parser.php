<html>
  <body>
    <h1>Parse artist data from The Metropolitan Museum of Art</h1>
    <div>Based on criteria set in form, parses a public <a href="https://github.com/metmuseum/openaccess/blob/master/MetObjects.csv" target=_blank>CSV</a> file from The Met and displays results as JSON, grouped by artist</div>
    <br><br>
    <?php
      $checkedA = '';
      $checkedJ = '';
      if (isset($_GET['displayAs']) && $_GET['displayAs'] == "array"){ $checkedA = "checked";
      } else{ $checkedJ = "checked"; }
      $start = (isset($_GET['start'])) ? $_GET['start'] : 1400;
      $end = (isset($_GET['end'])) ? $_GET['end'] : 1499;
    ?>
    <form>
      Start Year:<br />
      <input type="text" name="start" value="<?php print $start; ?>">
      <br>
      End Year:<br />
      <input type="text" name="end" value="<?php print $end; ?>"><br /><br />
      Display As:<br />
      <input type="radio" name="displayAs" value="json" <?php print $checkedJ; ?>>JSON<br />
      <input type="radio" name="displayAs" value="array" <?php print $checkedA; ?>>Array<br />
      <br />
      <input type="submit" value="Submit">
    </form>
    <hr>

    <?php if(!empty($_GET["start"]) && !empty($_GET["end"])){
      $artistResults = getResults($_GET["start"], $_GET["end"]);

      if ($_GET["displayAs"] == "json"){
        ksort($artistResults);
        $artistResults = array_values($artistResults);
        $result = json_encode($artistResults, JSON_HEX_QUOT | JSON_HEX_TAG);
        print $result;
      }else{
        echo '<pre>'; print_r($artistResults); echo '</pre>';
      }
    } ?>

  </body>

</html>

<?php

/****
 Takes artist data and puts into array
****/
function createRecord($data){

  $result['id'] = $data[0];
  $result['event'] = $data[6];
  $result['start'] = $data[19];
  $result['end'] = $data[20];
  $result['info'] = '<a href="'. $data[40] .'" target=_blank>'. $data[14] .'</a>';
  $result['type'] = $data[5];
  $result['wiki_results'] = 0;

  return $result;
}

/****
 Opens csv file and parses data based on selected criteria (start & end date)
 returns array of grouped artists
****/
function getResults($start, $end){
  $row = 1;
  $result = 0;
  $artist = [];
  $key_array = [];
  $artistCount = 0;

  if (($handle = fopen("MetObjects.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);

        if ($row === 1){ $key_array = $data; }

        $row++;

        // ignores any record not created by an "Artist"
        if (isset($data[12]) && trim($data[12]) != "Artist"){
          continue;
        }

        // ignores all artork created by "Annonymous" artists
        if (isset($data[14]) && (substr( $data[14], 0, 9 ) === "Anonymous")){
          continue;
        }

        // ignores all artwork that...
        // has no title (data[6])
        // isn't in the public domain (data[2])
        // has no link resource (data[40])
        // falls outside of our selected years (data[19] - data[20])
        if (empty($data[6]) || (isset($data[2]) && $data[2] == "False")  ||
          (empty($data[23])) ||
          (empty($data[40])) ||
          (empty($data[19])) ||
          ($data[19] >= $end ||
          $data[20] <= $start)){
            continue;
        }

        $result++;
        $end = trim($data[20]);
        if (!empty($data[17]) && strlen(trim($data[19])) == 4 && strlen($end) == 4 && strlen($end) == 4 && $end < 9999){

          $artistCount++;

          $artist[$data[17]] = [
            "id" => $artistCount,
            "start" => $data[19],
            "end" => $end,
            "type" => "Artist Metropolitan Museum",
            "event" => $data[14],
            "wiki_results" => 1,
            "info" => !empty($artist[$data[17]]) ? $artist[$data[17]]['info'] .'<div><a href="'. $data[40] .'" target=_blank>'. $data[6] .'</a></div>' : '<div><a href="'. $data[40] .'" target=_blank>'. $data[6] .'</a></div>',
          ];
        }

        // sets output
        $record[] = createRecord($data);

    }
    fclose($handle);
  }

  return $artist;

}

?>
