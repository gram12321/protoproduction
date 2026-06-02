import { useState } from "react";
import {
  CITY_DATA,
  CITY_TYPES,
  BASE_CONSUMPTION_BY_RESOURCE,
} from "@/lib/constants";
import { calculateBaseCityDemandByResource } from "@/lib/services";
import type { CityType, ResourceType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { NativeSelect } from "./native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function formatLocationName(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CityMarketplaceCard() {
  const [selectedCity, setSelectedCity] = useState<CityType>(CITY_TYPES[0]);

  const baseDemandByResource = calculateBaseCityDemandByResource(selectedCity);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl">City marketplace</CardTitle>
          <CardDescription>
            Base demand preview for {formatLocationName(selectedCity)}.
          </CardDescription>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
          <label
            htmlFor="marketplace-city-select"
            className="text-xs font-medium uppercase tracking-normal text-muted-foreground"
          >
            Marketplace city
          </label>
          <NativeSelect
            id="marketplace-city-select"
            aria-label="Marketplace city"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value as CityType)}
            className="sm:max-w-[220px]"
          >
            {CITY_TYPES.map((city) => (
              <option key={city} value={city}>
                {formatLocationName(city)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Base city demand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(BASE_CONSUMPTION_BY_RESOURCE).map((resource) => (
                <TableRow key={resource}>
                  <TableCell className="font-medium capitalize">
                    {resource}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(
                      baseDemandByResource[resource as ResourceType],
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Population: {formatNumber(CITY_DATA[selectedCity].population)}
        </p>
      </CardContent>
    </Card>
  );
}
