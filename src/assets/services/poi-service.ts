import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { PageResponse, Poi, PoiCreateDto } from "../entities/poiEntities";

@Injectable({
  providedIn: 'root'
})
export class PoiService {
  private apiUrl = 'http://localhost:8080/api/pois';
  public PAGE_SIZE = 32;
  private _poiListSubject = new BehaviorSubject<Poi[]>([]);
  poiList$ = this._poiListSubject.asObservable();

  constructor(private http: HttpClient) { }

  // METODI PER BEHAVIOR SUBJECT PoiList
  getPoiList(): Poi[] {
    return this._poiListSubject.value;
  }

  setPoiList(list: Poi[]) {
    this._poiListSubject.next(list);
  }

  updatePoiListElement(updated: Poi) {
    const list = this.getPoiList();
    const newList = list.map(p =>
      p.uuid === updated.uuid ? { ...updated } : p
    );
    this.setPoiList(newList);
  }

  removePoiListElement(uuid: string) {
    const newList = this._poiListSubject.value.filter(p => p.uuid !== uuid);
    this.setPoiList(newList);
  }

  // METODI PER CONTATTARE API
  getAllPois(): Observable<Poi[]> {
    return this.http.get<Poi[]>(`${this.apiUrl}/getAll`);
  }

  searchPois(searchParams: any, page: number = 0, size: number = this.PAGE_SIZE): Observable<PageResponse<Poi>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchParams.name) {
      params = params.set('name', searchParams.name);
    }
    if (searchParams.areaGroup) {
      params = params.set('areaGroup', searchParams.areaGroup);
    }
    if (searchParams.constructionCentury) {
      params = params.set('constructionCentury', searchParams.constructionCentury);
    }
    if (searchParams.generalDescription) {
      params = params.set('generalDescription', searchParams.generalDescription);
    }
    if (searchParams.address) {
      params = params.set('address', searchParams.address);
    }
    if (searchParams.isLocalized !== undefined) {
      params = params.set('isLocalized', searchParams.isLocalized.toString());
    }
    return this.http.get<PageResponse<Poi>>(`${this.apiUrl}/search`, { params });
  }

  getPoi(uuid: string): Observable<Poi> {
    return this.http.get<Poi>(`${this.apiUrl}/get/${uuid}`);
  }

  createPoi(dto: PoiCreateDto): Observable<Poi> {
    return this.http.post<Poi>(`${this.apiUrl}/create`, dto);
  }

  updatePoi(uuid: string, dto: PoiCreateDto): Observable<Poi> {
    return this.http.put<Poi>(`${this.apiUrl}/update/${uuid}`, dto);
  }

  deletePoi(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${uuid}`);
  }
}