import { StonfiService } from './module/stonfi';

const stonfiService = new StonfiService();

const price = await stonfiService.getPrice(
    
    "EQA3AshPEVly8wQ6mZincrKC_CkJSKXqqjyg0VMsVjF_CATS",
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    // "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7",
    1000000000000000000
);

console.log(price);