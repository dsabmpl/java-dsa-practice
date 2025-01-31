class SwapDigitWithPos {
    public static void main(String[] args) {
        int num = 32145;
        int sum = 0;
        // Step - 1 get the position of every digit
        int position = 0;
        while (num != 0) {
            // get the digit from the number
            int digit = num % 10;
            position++; // position = position + 1
            int pow = (int) Math.pow(10, digit - 1);
            int val = position * pow;
            sum = sum + val;
            num = num / 10;
        }
        System.out.println(sum);
    }
}