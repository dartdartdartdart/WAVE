export async function searchPlaces(
    query: string,
    apiKey: string
  ) {
    if (!query.trim()) return [];
  
    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress",
          },
          body: JSON.stringify({
            textQuery: query,
          }),
        }
      );
  
      const data = await response.json();
  
      return data.places || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }